class Pager {

  constructor($el, {nextPage, prevPage, useCanvasLabel}) {
    this.$paging = $el;
    this.useCanvasLabel = useCanvasLabel;
    this.$pagingPosition = this.$paging.querySelector('.paging__position');
    this.$pagingTimeout = null;
    this.$paging.querySelector('.paging__next').addEventListener('click', nextPage);
    this.$paging.querySelector('.paging__previous').addEventListener('click', prevPage);
  }

  render(label, index, total, offset) {
    clearTimeout(this.$pagingTimeout);
    this.$pagingPosition.classList.add('paging__position--active');
    this.$pagingTimeout = setTimeout(() => {
      this.$pagingPosition.classList.remove('paging__position--active');
    }, 2000);
    this.$pagingPosition.style.left = `${offset}%`;
    if (this.useCanvasLabel) {
      this.$pagingPosition.innerText = label;
    } else {
      this.$pagingPosition.innerText = `${label} ${index + 1} of ${total}`;
    }
  }
}

export default Pager;
