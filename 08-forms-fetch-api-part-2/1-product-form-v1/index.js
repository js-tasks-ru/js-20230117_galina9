import escapeHtml from "./utils/escape-html.js";
import fetchJson from "./utils/fetch-json.js";

const IMGUR_CLIENT_ID = "28aaa2e823b03b1";
const BACKEND_URL = "https://course-js.javascript.ru";

export default class ProductForm {
  element;
  subElements = {};
  defaultDataValue = {
    title: "",
    description: "",
    quantity: 1,
    subcategory: "",
    status: 1,
    images: [],
    price: 100,
    discount: 0,
  };

  onSubmit = (event) => {
    event.preventDefault();

    this.save();
  };

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const data = await this.loadAllDatas();

    const [categoriesData, productData] = [...data];

    this.categories = categoriesData;
    this.data = productData;

    this.renderForm(...this.data);
    if (this.data) {
      this.initEventListeners();
    }

    return this.element;
  }

  async loadAllDatas() {
    const categories = this.loadCategories();
    const productIdData = this.productId
      ? this.loadProductById(this.productId)
      : Promise.resolve([this.defaultDataValue]);
    const data = await Promise.all([categories, productIdData]);

    return data;
  }

  initEventListeners() {
    const {
      productForm,
      "sortable-list-container": uploadImage,
      imageListContainer,
    } = this.subElements;

    productForm.addEventListener("submit", this.onSubmit);
    uploadImage.addEventListener("click", this.uploadImage);
  }

  async save() {
    const product = this.getProductData();

    const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    });

    this.dispatchEvent(result.id);
  }

  getProductData() {
    const { productForm, imageListContainer } = this.subElements;
    const formData = new FormData(productForm);
    const imgsCollection = imageListContainer.querySelectorAll(
      ".sortable-table__cell-img"
    );
    const product = {};
    const images = [];

    for (const img of imgsCollection) {
      images.push({ source: img.alt, url: img.src });
    }

    for (let [key1, key2] of formData) {
      switch (key1) {
        case "quantity":
        case "price":
        case "discount":
        case "status":
          product[key1] = parseFloat(key2);
          break;
        default:
          product[key1] = key2;
      }
    }
    product.id = this.productId;
    product.images = images;

    return product;
  }

  renderForm(data) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getForm(data);

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
  }

  getForm(data) {
    return `<div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required type="text" id="title" name="title" class="form-control" placeholder="Название товара" value='${
              data.title
            }'>
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание товара</label>
          <textarea required class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара">${
            data.description
          }</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
            <ul class="sortable-list">
            ${this.getImagesList()}
            </ul>
          </div>
          <button type="button" id="uploadImage" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.getSubCategores()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input type="number" id="price" name="price" class="form-control" placeholder="100" value="${
              data.price
            }">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input type="number" id="discount" name="discount" class="form-control" placeholder="0" value="${
              data.discount
            }">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input type="number" id="quantity" class="form-control" name="quantity" placeholder="1" value="${
              data.quantity
            }">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" id="status" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" id="save" name="save" class="button-primary-outline">
          ${this.productId ? "Сохранить товар" : "Добавить товар"}
          </button>
        </div>
      </form>
    </div>`;
  }

  getSubCategores() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<select class="form-control" name="subcategory" id="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    const options = this.categories.map(({ id, title, subcategories }) => {
      if (subcategories.length) {
        return subcategories.map(
          ({ title: subTitle }) =>
            `<option value='${id}'>${title} > ${subTitle}</option>`
        );
      } else {
        return `<option value='${id}'>${title}</option>`;
      }
    });
    select.append(Object.fromEntries(options));

    select.innerHTML = options.join("");

    return select.outerHTML;
  }

  getImagesList() {
    const imgsList = this.data.map((data) =>
      data.images
        .map(
          (img) => `
          <li class="products-edit__imagelist-item sortable-list__item">
            <span>
              <img src="./icon-grab.svg" data-grab-handle alt="grab">
              <img class="sortable-table__cell-img" alt="${escapeHtml(
                img.source
              )}" src="${escapeHtml(img.url)}">
              <span>${escapeHtml(img.source)}</span>
            </span>
            <button type="button">
              <img src="./icon-trash.svg" alt="delete" data-delete-handle>
            </button>
          </li>`
        )
        .join("")
    );
    return imgsList;
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

  loadCategories() {
    return fetchJson(
      `${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`
    );
  }

  loadProductById(id) {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${id}`);
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    this.element.remove();
  }
}
