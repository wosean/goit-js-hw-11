import ImagesApiService from './images-api-service.js';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const MESSAGE_TIMEOUT = 2000;

const refs = {
  form: document.getElementById('search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

const imagesService = new ImagesApiService();

let lightbox = new SimpleLightbox('.gallery a', {
  overlay: true,
  overlayOpacity: 0.7,
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});
//сховали кнопку load More
hideElement(refs.loadMoreBtn);

refs.form.addEventListener('submit', onSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSubmit(e) {
  e.preventDefault();

  hideElement(refs.loadMoreBtn);
// зберігаємо пошуковий запит в опції
  imagesService.query = e.target.searchQuery.value.trim(); 

// Якщо запит порожній
  if (imagesService.query === '') {
    return Notiflix.Notify.failure('Input your real search query', {
      timeout: MESSAGE_TIMEOUT,
    });
  }

  imagesService.resetPage();
  imagesService
    .fetchImages()
    .then(({ hits, total }) => {

      clearCardsContainer();

      if (hits.length === 0) {
        
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.',
          {
            timeout: MESSAGE_TIMEOUT,
          }
        );
      } else {
        appendCardsMarkup(hits);

        Notiflix.Notify.success(`Hooray! We found ${total} images.`, {
          timeout: MESSAGE_TIMEOUT,
        });
      }

 // якщо кількість карток більша за дефолтну кількість карток на сторінці -
 // то показуємо кнопку Load More (Завантажити ще)
      if (total > imagesService.perPage) {
 // показуємо кнопку		  
        showElement(refs.loadMoreBtn);
      }
    })
    .catch(err => { console.log(err) });
}

function onLoadMore() {
// Беремо значення поточної сторінки й значення кількости сторінок всього
  const currentPage = imagesService.currentPage;
  const totalPages = imagesService.totalPages;
  console.log(totalPages);

  imagesService
    .fetchImages()
    .then(({ hits, total }) => {
      appendCardsMarkup(hits);
      scrollDown();

// Якщо юзер дійшов до останньої сторінки
      if (totalPages === currentPage) {
        hideElement(refs.loadMoreBtn);

        return Notiflix.Notify.failure(
          `We're sorry, but you've reached the end of search results.`,
          {
            timeout: MESSAGE_TIMEOUT,
          }
        );
      }
    })
    .catch(console.log);
}

// Створення розмітки
function createMarkup(cards) {
  return cards
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `<div class="photo-card">
  <a class="photo-card-link" href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes: </b>
      <span>${likes}</span>
    </p>
    <p class="info-item">
      <b>Views:</b>
      <span>${views}</span>
    </p>
    <p class="info-item">
      <b>Comments:</b>
      <span>${comments}</span>
    </p>
    <p class="info-item">
      <b>Downloads:</b>
      <span>${downloads}</span>
    </p>
  </div>
</div>
`
    )
    .join('');
}

// Додавання розмітки на сторінку + оновлення Лайтбоксу
function appendCardsMarkup(cards) {
  refs.gallery.insertAdjacentHTML('beforeend', createMarkup(cards));
  lightbox.refresh();
}

// Очищення контейнеру з картками
function clearCardsContainer() {
  refs.gallery.innerHTML = '';
}

// Показати елемент
function showElement(element) {
  element.classList.remove('is-hidden');
}

// Сховати елемент
function hideElement(element) {
  element.classList.add('is-hidden');
}

// Повільна прокрутка
function scrollDown() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}