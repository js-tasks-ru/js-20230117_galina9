import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  element;
  subElements = {};
  data = [];
  loading = false;
  step = 20;
  start = 1;
  end = this.start + this.step;

  onWindowScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (
      bottom < document.documentElement.clientHeight &&
      !this.loading &&
      !this.isSortLocally
    ) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.loading = true;

      const data = await this.loadData(id, order, this.start, this.end);
      this.update(data);

      this.loading = false;
    }
  };

  onClick = (event) => {
    const column = event.target.closest('[data-sortable="true"]');
    const toggleOrder = (order) => {
      const orders = {
        asc: "desc",
        desc: "asc",
      };

      return orders[order];
    };

    if (column) {
      const { id, order } = column.dataset;
      const newOrder = toggleOrder(order);

      this.sorted = {
        id,
        order: newOrder,
      };

      column.dataset.order = newOrder;
      column.append(this.subElements.arrow);

      if (this.isSortLocally) {
        this.sortOnClient(id, newOrder);
      } else {
        this.sortOnServer(id, newOrder);
      }
    }
  };

  constructor(
    headerConfig = [],
    {
      url = "",
      sorted = {
        id: headerConfig.find((item) => item.sortable).id,
        order: "asc",
      },
      isSortLocally = false,
    } = {}
  ) {
    this.url = new URL(url, BACKEND_URL);
    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
  }

  async render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;

    this.subElements = this.getSubElements(element);

    const data = await this.loadData(
      this.sorted.id[0].title,
      this.sorted.order,
      this.start,
      this.end
    );

    this.data = data;

    this.subElements.body.innerHTML = this.getTableRows(data);

    this.initEventListeners();
  }

  update(data) {
    const rows = document.createElement("div");

    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  async loadData(id, order, start = this.start, end = this.end) {
    this.url.searchParams.set("_sort", id);
    this.url.searchParams.set("_order", order);
    this.url.searchParams.set("_start", start);
    this.url.searchParams.set("_end", end);

    this.element.classList.add("sortable-table_loading");

    const data = await fetchJson(this.url);

    this.element.classList.remove("sortable-table_loading");

    return data;
  }

  initEventListeners() {
    this.subElements.header.addEventListener("pointerdown", this.onClick);
    document.addEventListener("scroll", this.onWindowScroll);
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        <div data-element="loading" class="loading-line sortable-table__loading-line">
        </div>
        ${this.getTableBody(this.data)}
      </div>`;
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map((item) => this.getHeaderRow(item)).join("")}
    </div>`;
  }

  getTableBody(data) {
    if (!data.length) "<p>We have no products yet, please come back later!</p>";
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : "asc";

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${this.getHeaderSortingArrow(id)}
      </div>
    `;
  }

  getTableRows(data) {
    return data
      .map(
        (item) => `
      <div class="sortable-table__row">
        ${this.getTableRow(item)}
      </div>`
      )
      .join("");
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return {
        id,
        template,
      };
    });

    return cells
      .map(({ id, template }) => {
        return template
          ? template(item[id])
          : `<div class="sortable-table__cell">${item[id]}</div>`;
      })
      .join("");
  }

  getHeaderSortingArrow(id) {
    const isOrderExist = this.sorted.id === id ? this.sorted.order : "";

    return isOrderExist
      ? `<span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>`
      : "";
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find((item) => item.id === id);
    const { sortType, customSorting } = column;
    const direction = order === "asc" ? 1 : -1;

    return arr.sort((a, b) => {
      switch (sortType) {
        case "number":
          return direction * (a[id] - b[id]);
        case "string":
          return direction * a[id].localeCompare(b[id], "ru");
        case "custom":
          return direction * customSorting(a, b);
        default:
          return direction * (a[id] - b[id]);
      }
    });
  }

  sortOnClient(id, order) {
    const sortedData = this.sortData(id, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;
    const data = await this.loadData(id, order, start, end);

    this.getTableRows(data);
  }

  remove() {
  this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
