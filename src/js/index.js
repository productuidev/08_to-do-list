import '@fortawesome/fontawesome-free/js/all.min.js';
import '../scss/style.scss';

class Router {
  routes = []; // array
  notFoundCallback = () => {};

  // 해당되는 url 진입 시 콜백 실행
  addRoute(url, callback) {
    this.routes.push({
      url,
      callback,
    });
    return this; // 인스턴스 생성 시 체이닝을 사용할 수 있도록 return (ex : Router.addRoute().addRouter())
  }

  // 해당 라우트가 맞는지 체크
  checkRoute() {
    // currentRoute는 routes array에서 찾아야 하는 값
    const currentRoute = this.routes.find(
      route => route.url === window.location.hash, // 현재 #값과 현재 url을 대조해서 맞는 route를 return
    );

    // 원하는 라우트가 없을 때 처리하는 조건
    // currentRount가 존재하지 않으면 notFoundCallback 실행
    if (!currentRoute) {
      this.notFoundCallback();
      return;
    }
    currentRoute.callback(); // 맞으면 콜백실행
  }

  // router 초기화
  init() {
    window.addEventListener('hashchange', this.checkRoute.bind(this));
    // 현재 #값이 없는 경우 조건
    if (!window.location.hash) {
      window.location.hash = '#/';
    }

    this.checkRoute();
  }

  setNotFound(callback) {
    this.notFoundCallback = callback;
    return this;
  }
}

// web storage
// {id, content, status}
class Storage {
  saveTodo(id, todoContent) {
    const todosData = this.getTodos();
    todosData.push({ id, content: todoContent, status: 'TODO' });
    localStorage.setItem('todos', JSON.stringify(todosData));
  }

  editTodo() {}

  deleteTodo() {}

  getTodos() {
    return localStorage.get('todos') === null
      ? []
      : JSON.parse(localStorage.get('todos'));
  }
}

class TodoList {
  constructor(storage) {
    this.initStorage(storage);
    this.assignElement();
    this.addEvent();
  }

  initStorage(storage) {
    this.storage = storage;
  }

  assignElement() {
    this.inputContainerEl = document.getElementById('input-container');
    this.inputAreaEl = this.inputContainerEl.querySelector('#input-area');
    this.todoInputEl = this.inputAreaEl.querySelector('#todo-input');
    this.addBtnEl = this.inputAreaEl.querySelector('#add-btn');
    this.todoContainerEl = document.getElementById('todo-container');
    this.todoListEl = this.todoContainerEl.querySelector('#todo-list');
    this.radioAreaEl = this.inputContainerEl.querySelector('#radio-area');
    this.filterRadioBtnEls = this.radioAreaEl.querySelectorAll(
      'input[name="filter"]',
    ); // filter 버튼 3개 모두 탐색
  }

  // 저장된 데이터를 불러오기
  loadSavedData() {
    const todosData = this.storage.getTodos();
    for (const todoData of todosData) {
      // element 생성
      const { id, content, status } = todoData;
      this.createTodoElement();
    }
  }

  addEvent() {
    this.addBtnEl.addEventListener('click', this.onClickAddBtn.bind(this));
    this.todoListEl.addEventListener('click', this.onClickTodoList.bind(this));
    this.addRadioBtnEvent();
  }

  // 할일 상태별 필터링 이벤트
  addRadioBtnEvent() {
    for (const filterRadioBtnEl of this.filterRadioBtnEls) {
      filterRadioBtnEl.addEventListener(
        'click',
        this.onClickRadioBtn.bind(this),
      );
    }
  }

  // radio btn 이벤트
  onClickRadioBtn(event) {
    const { value } = event.target;
    // console.log(value);
    // this.filterTodo(value);

    // 버튼 클릭 시 라우터 url 표시
    window.location.href = `#/${value.toLowerCase()}`;
  }

  // filtering
  filterTodo(status) {
    const todoDivEls = this.todoListEl.querySelectorAll('div.todo');
    for (const todoDivEl of todoDivEls) {
      switch (status) {
        case 'ALL':
          todoDivEl.style.display = 'flex';
          break;
        case 'DONE':
          todoDivEl.style.display = todoDivEl.classList.contains('done')
            ? 'flex'
            : 'none';
          break;
        case 'TODO':
          todoDivEl.style.display = todoDivEl.classList.contains('done')
            ? 'none'
            : 'flex';
          break;
      }
    }
  }

  // todo btn 이벤트
  onClickTodoList(event) {
    const { target } = event;
    const btn = target.closest('button');

    // btn이 null일 때의 조건 추가
    // console.log(btn);
    if (!btn) return; // = false

    if (btn.matches('#delete-btn')) {
      this.deleteTodo(target);
    } else if (btn.matches('#edit-btn')) {
      this.editTodo(target);
    } else if (btn.matches('#save-btn')) {
      this.saveTodo(target);
    } else if (btn.matches('#complete-btn')) {
      this.completeTodo(target);
    }
  }

  // 할일 삭제
  deleteTodo(target) {
    const todoDiv = target.closest('.todo');
    if (window.confirm('정말 삭제하시겠습니까?')) {
      todoDiv.addEventListener('transitionend', () => {
        todoDiv.remove();
      });
    }
    todoDiv.classList.add('delete');
  }

  // 할일 수정
  editTodo(target) {
    const todoDiv = target.closest('.todo');
    const todoInputEl = todoDiv.querySelector('input');
    todoInputEl.readOnly = false;
    todoInputEl.focus();
    todoDiv.classList.add('edit');
  }

  // 할일 수정 후 저장
  saveTodo(target) {
    const todoDiv = target.closest('.todo');
    todoDiv.classList.remove('edit');

    // 수정된 값 가져오기 (저장된 값을 가져오는 것은 이후 localStorage에서..)
    const todoInputEl = todoDiv.querySelector('input');
    todoInputEl.readOnly = true;
  }

  // 할일 완료 체크
  completeTodo(target) {
    const todoDiv = target.closest('.todo');
    todoDiv.classList.toggle('done');
  }

  // 할일 추가 (onClickAddBtn 누르면 목록에 데이터가 생성되고 있는 지점에 localStorage 데이터를 추가)
  // unique한 ID (localStorage에 불러오더라도 겹치지 않을..)
  onClickAddBtn() {
    if (this.todoInputEl.value.length === 0) {
      alert('내용을 입력해주세요');
      return;
    }

    const id = Date.now(); // 현재 시간을 ms 단위로 반환 -> 만드는 시점의 시간마다 달라지므로 unique한 ID로 사용 가능 (데이터 담기)
    this.storage.saveTodo(id, this.todoInpulEl.value);

    this.createTodoElement(id, this.todoInputEl.value); // id 파라미터 추가
  }

  // todo 동적생성
  // 처음 만들었을 때는 value만 받았는데 storage 저장을 위해 id, status도 추가 (새로 생성될 때는 status 값이 없음 = null)
  createTodoElement(id, value, status = null) {
    const todoDiv = document.createElement('div');
    todoDiv.classList.add('todo');

    const todoContent = document.createElement('input');
    todoContent.value = value; // createTodoElement(this.todoInputEl.value)의 value
    todoContent.readOnly = true; // default
    todoContent.classList.add('todo-item');

    const fragment = new DocumentFragment();
    fragment.appendChild(todoContent);
    fragment.appendChild(
      this.createButton('complete-btn', 'complete-btn', ['fas', 'fa-check']),
    );
    fragment.appendChild(
      this.createButton('edit-btn', 'edit-btn', ['fas', 'fa-edit']),
    );
    fragment.appendChild(
      this.createButton('save-btn', 'save-btn', ['fas', 'fa-save']),
    );
    fragment.appendChild(
      this.createButton('delete-btn', 'delete-btn', ['fas', 'fa-trash']),
    );
    todoDiv.appendChild(fragment);

    this.todoListEl.appendChild(todoDiv); // 추가
    this.todoInputEl.value = ''; // 할일 추가 후 입력한 input 내용 지움
  }

  // 3가지 매개변수
  createButton(btnId, btnClassName, iconClassName) {
    const btn = document.createElement('button');
    const icon = document.createElement('i');
    icon.classList.add(...iconClassName);

    btn.appendChild(icon);
    btn.id = btnId;
    btn.classList.add(btnClassName);

    return btn;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const router = new Router(); // 인스턴스
  const todoList = new TodoList(new Storage()); // storage 인스턴스

  // ALL/TODO/DONE 상태 필터
  // input type='radio' value='상태값' 체크
  // closure
  const routeCallback = status => () => {
    todoList.filterTodo(status);
    document.querySelector(
      `input[type='radio'][value='${status}']`,
    ).checked = true;
  };
  // 상태값에 따른 실행
  router
    .addRoute('#/all', routeCallback('ALL'))
    .addRoute('#/todo', routeCallback('TODO'))
    .addRoute('#/done', routeCallback('DONE'))
    .setNotFound(routeCallback('ALL')) // 위 3개 상태에 해당되지 않을 때 모두 다 보여주는 콜백 실행
    .init(); // hashChange 감지
});
