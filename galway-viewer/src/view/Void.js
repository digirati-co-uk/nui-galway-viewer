import {div} from "../utils";

export default class Void {
  constructor($el) {
    $el.innerText = '';
    this.previous = div();
    this.osdPrevious = div();
    this.osd = div();
    this.osdNext = div();
    this.next = div();

    $el.appendChild(this.previous);
    $el.appendChild(this.osdPrevious);
    $el.appendChild(this.osd);
    $el.appendChild(this.osdNext);
    $el.appendChild(this.next);
  }
}
