import { Component, Input, OnChanges } from '@angular/core';
import { Order, Quote, AttachmentService } from '@congacommerce/ecommerce';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-attachment',
  templateUrl: './attachment.component.html',
  styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent implements OnChanges {
  @Input() item: Order | Quote;
  attachments: any = null;
  parentId: string = null;
  file: File;
  /** 
   * uploadFileList used for input FileList
  */
  uploadFileList = [];
  /**
   * hasSizeError flag to check max-file-size limit
   */
  hasSizeError: boolean = false;

  constructor(private attachmentService: AttachmentService) { }

  ngOnChanges() {
    if (!this.item) {
      return;
    }
    if (this.item instanceof Quote) {
      this.attachments = this.item.Attachments;
      this.parentId = this.item.Id;
    }
  }

  /**
   * @ignore 
   */
  fileChange(event) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.uploadFileList = event.target.files;
      let totalFileSize = 0;
      for (let i = 0; i < this.uploadFileList.length; i++) {
        totalFileSize = totalFileSize + this.uploadFileList[i].size;
      }
      this.hasSizeError = totalFileSize > event.target.dataset.maxSize;
      this.file = fileList[0];

    }
  }
  /**
   * @ignore 
   */
  onSubmit() {
    this.attachmentService.uploadAttachment(this.file, this.parentId).pipe(take(1)).subscribe(() => {})
  }

}

