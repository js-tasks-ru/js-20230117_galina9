export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headersConfig = headerConfig;
    this.data = data;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getTable() {
    return `
    <div class="sortable-table">
     <div data-element="header" class="sortable-table__header sortable-table__row">
        ${ this.getTableHeader() }
     </div>
     <div data-element="body" class="sortable-table__body">
     ${ this.getTableBody() }
     </div>
    </div>
    `;
  }

  getTableHeader() {
    const template = this.headersConfig.map(elem => `
        <div class="sortable-table__cell" data-id="${ elem.id }" data-sortable="${ elem.sortable }">
            <span>${ elem.title }</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
                <span class="sort-arrow"></span>
            </span>
        </div>`);

    return template.join('');
  }

  getTableBody() {
    return `<div data-element="body" class="sortable-table__body">
                ${ this.getTableRows(this.data) }
            </div>`;
  }

  getTableRows(data = []) {
    return data.map(item => {
      return `
        <a href="/products/${ item.id }" class="sortable-table__row">
          ${ this.getTableRow(item) }
        </a>`;
    }).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({ id, template }) => {
      return {
        id,
        template
      };
    });

    return cells.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class="sortable-table__cell">${ item[id] }</div>`;
    }).join('');
  }

  removeArrow() {
    const dataOrders = document.querySelectorAll(`[data-element = 'data-order']`);

    for (const item of dataOrders) {
      item.remove();
    }
  }

  sort(field, order) {
    this.removeArrow();

    const sortedData = this.sortData(field, order);
    const sortableField = document.querySelector(`[data-id = ${ field }]`);
    sortableField.setAttribute('data-order', order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(item => item.id === field);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string':
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

