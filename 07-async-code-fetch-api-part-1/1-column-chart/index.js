import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class ColumnChart {
  chartHeight = 50;

  constructor({
    url = "",
    data = [],
    label = "",
    link = "",
    range = {
      from: new Date(),
      to: new Date(),
    },
    ...otherProps
  } = {}) {
    this.data = data;
    this.url = new URL(url, BACKEND_URL);
    this.label = label;
    this.link = link;
    this.range = range;
    this.otherProps = otherProps;

    this.render();
    this.update(this.range.from, this.range.to);
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    if (this.data?.length) {
      this.element.classList.remove("column-chart_loading");
    }

    this.subElements = this.getSubElements();
  }

  getTemplate() {
    return `
          <div class="column-chart column-chart_loading" style="--chart-height: ${
            this.chartHeight
          }">
              <div class="column-chart__title">
                  Total ${this.label}
                  ${this.getLink()}
              </div>
              <div class="column-chart__container">
              <div data-element="header" class="column-chart__header"></div>
              <div data-element="body" class="column-chart__chart"></div>
              </div>
          </div>
      `;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  getLink(label) {
    return this.link
      ? `<a href="${
          this.link || label
        }" class="column-chart__link">View all</a>`
      : "";
  }

  getColumns(data = []) {
    const columnProps = this.getColumnProps(data);
    const chart = columnProps.map((item) => {
    const { percent, value } = item;

      return `<div style="--value: ${value}" data-tooltip="${percent}"></div>`;
    });

    return chart.join("");
  }

  getColumnProps(data = []) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;

    return Object.values(data).map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + "%",
        value: String(Math.floor(item * scale)),
      };
    });
  }

  async loadData(from, to) {
    this.url.searchParams.set("from", from.toISOString());
    this.url.searchParams.set("to", to.toISOString());

    return await fetchJson(this.url);
  }

  async update(from, to) {
    const data = await this.loadData(from, to);

    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.formatHeading(data);
      this.subElements.body.innerHTML = this.getColumns(data);

      this.element.classList.remove("column-chart_loading");
    }

    return data
  }

  formatHeading(data) {
    const formatValue = new Intl.NumberFormat("en").format(...Object.values(data));

    return this.otherProps["formatHeading"]
      ? this.otherProps.formatHeading(formatValue)
      : formatValue;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
  }
}
