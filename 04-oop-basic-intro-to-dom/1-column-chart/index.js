export default class ColumnChart {

  chartHeight = 50;

  constructor(
    { data, label, value, link, ...otherProps } =
    { data: [], label: '', link: '', value: 0, }
  ) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.otherProps = otherProps;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('column-chart', 'column-chart_loading');
    wrapper.style['--chart-height'] = this.chartHeight;

    if (this.data?.length) {
      wrapper.classList.toggle('column-chart_loading');
    }

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper;
  }

  getTemplate() {
    return `
      <div class="column-chart__title">
        Total ${ this.label }
        ${ this.getLink() }
      </div>
      <div class="column-chart__container">${ this.getColumnChartTemplate() }</div>
    `;
  }

  getColumnChartTemplate() {
    return `
    <div data-element="header" class="column-chart__header">
        ${ this.formatHeading(this.value) }
    </div>
    <div data-element="body" class="column-chart__chart"> ${this.getColumns(this.data)}</div>
    `;
  }

  getLink(label = "/sales") {
    return this.link ? `<a href="${ this.link || label }" class="column-chart__link">View all</a>` : "";
  }

  getColumns(data = []) {
    let columnProps = this.getColumnProps(data);

    let chart = columnProps.map(item => {
      let {percent, value} = item;

      return `<div style="--value: ${ value }" data-tooltip="${ percent }"></div>`;
    });

    return chart.join('');
  }

  getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = 50 / maxValue;

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

    return !!this.otherProps['formatHeading'] ? this.otherProps.formatHeading(formatValue) : formatValue;
  }

  initEventListeners() {
    // NOTE: в данном методе добавляем обработчики событий, если они есть
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // NOTE: удаляем обработчики событий, если они есть
  }

}
