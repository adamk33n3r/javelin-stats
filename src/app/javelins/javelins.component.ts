import { Component, OnInit } from '@angular/core';
import { CompactJavelin } from '../classes/javelin';
import { JavelinService } from '../services/javelin.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddItemComponent } from '../add-item/add-item.component';
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-javelins',
  templateUrl: './javelins.component.html',
  styleUrls: ['./javelins.component.css']
})
export class JavelinsComponent implements OnInit {
  public javelins: any;
  private class: string;
  private slot: number;
  public url: string;
  public jav = new BehaviorSubject<CompactJavelin>(null);
  public inventory: boolean;

  constructor(
    public javelinService: JavelinService,
    public modalService: NgbModal
  ) { }

  ngOnInit() {
    this.slot = 0;
    this.inventory = false;

    this.javelins = this.javelinService.javelins.value;
    this.javelinService.parseUrl().subscribe(c => {
      this.class = c;
      this.jav.next(this.javelins[this.class][this.slot]);
    });

    this.javelinService.javelins.subscribe(j => {
      this.javelins = j;
      if (this.class !== null && this.slot !== null && this.class in j && this.slot in j[this.class]) {
        this.jav.next(this.javelins[this.class][this.slot]);
      }
    });
  }

  onSelect(c: string, slot: number) {
    this.class = c;
    this.slot = slot;
    this.inventory = false;
    this.jav.next(this.javelins[c][slot]);
  }

  import(slot: number) {
    this.slot = slot;
    this.javelins[this.class][this.slot] = this.javelins[this.class][0];
    this.javelinService.save(this.javelins);
    window.history.replaceState({}, document.title, window.location.pathname);
    this.onSelect(this.class, this.slot);
  }

  addItem(type: string) {
    const modalRef = this.modalService.open(AddItemComponent, {centered: true, backdrop: 'static' });
    modalRef.componentInstance.type = type;
  }

  getLink(modal: NgbModal) {
    if (this.class && this.slot) {
      this.javelinService.getLink(this.jav).pipe(take(1)).subscribe(url => this.url = url);
      this.modalService.open(modal);
    }
  }

  resetJav(modal: NgbModal) {
    this.modalService.open(modal);
  }

  resetJavConfirm(jav: CompactJavelin) {
    this.javelinService.resetJav(jav);
    this.modalService.dismissAll('');
  }

  resetCache() {
    localStorage.removeItem('items');
    localStorage.removeItem('javelins');
    location.reload();
  }

  toggleInventory() {
    this.inventory = !this.inventory;
  }

}
