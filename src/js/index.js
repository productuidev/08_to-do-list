import '@fortawesome/fontawesome-free/js/all.min.js';
import '../scss/style.scss';

class TodoList {
  constructor() {
    this.assignElement();
    this.addEvent();
  }

  assignElement() {
    this.inputContainerEl = document.getElementById('input-container');
    this.inputAreaEl = this.inputContainerEl.querySelector('#input-area');
    this.todoInputEl = this.inputAreaEl.querySelector('#todo-input');
    this.addBtnEl = this.inputAreaEl.querySelector('#add-btn');
    this.todoContainerEl = document.getElementById('todo-container');
    this.todoListEl = this.todoContainerEl.querySelector('#todo-list');
  }

  addEvent() {
    this.addBtnEl.addEventListener('click', this.onClickAddBtn.bind(this));
    this.todoListEl.addEventListener('click', this.onClickTodoList.bind(this));
  }

  onClickTodoList(event) {
    const { target } = event;
    const btn = target.closest('button');
    if (btn.matches('#delete-btn')) {
      this.deleteTodo(target);
    }
  }

  deleteTodo(target) {
    const todoDiv = target.closest('.todo');
    if (window.confirm('정말 삭제하시겠습니까?')) {
      todoDiv.addEventListener('transitionend', () => {
        todoDiv.remove();
      });
    }
    todoDiv.classList.add('delete');
  }

  onClickAddBtn() {
    if (this.todoInputEl.value.length === 0) {
      alert('내용을 입력해주세요');
      return;
    }

    this.createTodoElement(this.todoInputEl.value);
  }

  createTodoElement(value) {
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
  const todoList = new TodoList();
});
