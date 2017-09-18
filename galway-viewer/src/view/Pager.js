class Pager {

  constructor($el, {nextPage, prevPage}) {
    this.$paging = $el;
    this.$pagingPosition = this.$paging.querySelector('.paging__position');
    this.$pagingTimeout = null;
    this.$paging.querySelector('.paging__next').addEventListener('click', nextPage);
    this.$paging.querySelector('.paging__previous').addEventListener('click', prevPage);
  }

  render(canvas, index, total, offset) {
    clearTimeout(this.$pagingTimeout);
    this.$pagingPosition.classList.add('paging__position--active');
    this.$pagingTimeout = setTimeout(() => {
      this.$pagingPosition.classList.remove('paging__position--active');
    }, 2000);
    this.$pagingPosition.style.left = `${offset}%`;
    this.$pagingPosition.innerText = `${index + 1} of ${total}`;
  }
}

export default Pager;
