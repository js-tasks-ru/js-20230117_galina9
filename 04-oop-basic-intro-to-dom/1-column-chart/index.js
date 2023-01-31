export default class ColumnChart {

  chartHeight = 50;

  constructor({ data = [], label = "", value = "", link = "", ...otherProps } = {}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.otherProps = otherProps;

    this.render();
  }

  render() {
    this.element = this.getTemplate();
  }

  getTemplate() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('column-chart', 'column-chart_loading');
    wrapper.style['--chart-height'] = this.chartHeight;

    if (this.data?.length) {
      wrapper.classList.remove('column-chart_loading');
    }

    wrapper.innerHTML = `
      <div class="column-chart__title">
        Total ${ this.label }
        ${ this.getLink() }
      </div>
      <div class="column-chart__container">${ this.getColumnChartTemplate() }</div>
    `;

    return wrapper;
  }

  getColumnChartTemplate() {
    return `
    <div data-element="header" class="column-chart__header">
        ${ this.formatHeading(this.value) }
    </div>
    <div data-element="body" class="column-chart__chart"> ${this.getColumns(this.data)}</div>
    `;
  }

  getLink(label) {
    return this.link ? `<a href="${ this.link || label }" class="column-chart__link">View all</a>` : "";
  }

  getColumns(data = []) {
    const columnProps = this.getColumnProps(data);

    const chart = columnProps.map(item => {
      let {percent, value} = item;

      return `<div style="--value: ${ value }" data-tooltip="${ percent }"></div>`;
    });

    return chart.join('');
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map(item => {
      return {
        percent: (item / maxValue * 100).toFixed(0) + '%',
        value: String(Math.floor(item * scale))
      };
    });
  }

  update(newData) {
    this.getColumns(newData);
  }

  formatHeading(value) {
    const formatValue = new Intl.NumberFormat("en").format(value);

    return this.otherProps['formatHeading'] ? this.otherProps.formatHeading(formatValue) : formatValue;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }

}
