import axios from 'axios';
import Notiflix from 'notiflix';

const API_KEY = '38850372-7405887d5eb83635398d2d195';
const BASE_URL = 'https://pixabay.com/api/';

export default class ImagesApiService {
  constructor() {
    this.totalPages = 0;
    this.params = {
      q: '',
      page: 1,
      per_page: 40,
      key: API_KEY,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    };
  }

  async fetchImages() {
    
    try {
      const data = await axios.get(`${BASE_URL}`, { params: this.params });
// рoзрахунок, скільки всього буде сторінок для вибраної кількості картинок
      this.totalPages = Math.ceil(data.data.totalHits / this.params.per_page); 
      this.nextPage();
      return data.data;

    } catch (err) {
      Notiflix.Notify.failure(
        'Something went wrong. Please try again.',
        {
          timeout: 2000,
        }
      );
      // console.log(err);
    }
  }

  nextPage() {
    this.params.page += 1;
  }

  resetPage() {
    this.params.page = 1;
  }

  get currentPage() {
    return this.params.page;
  }

  get perPage() {
    return this.params.per_page;
  }

  get query() {
    return this.params.q;
  }

  set query(newQuery) {
    this.params.q = newQuery;
  }
}