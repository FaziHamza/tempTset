import { Component } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { DataSharedService } from 'src/app/services/data-shared.service';
import { SocketService } from 'src/app/services/socket.service';

@Component({
  selector: 'st-user-mapping',
  templateUrl: './user-mapping.component.html',
  styleUrls: ['./user-mapping.component.scss']
})
export class UserMappingComponent {
  policyName = '';
  defaultPolicy: boolean = false;
  policyList: any = [];
  listOfDisplayData: any = [];
  listOfData: any[] = [];
  userName = '';
  userList: any = [];
  isSubmit: boolean = true;
  loader: boolean = false;
  loading = false;
  pageSize = 10;
  pageIndex: any = 1;
  totalItems: number = 0; // Total number of items
  startIndex = 1;
  endIndex: any = 10;
  searchData: any[] = [];
  listOfColumns = [
    {
      name: 'User Name',
      key: 'userName',
      searchValue: '',
      visible: false,
    },
    {
      name: 'Policy Name',
      key: 'policyName',
      visible: false,
      searchValue: '',
    },
    {
      name: 'Default Policy',
      key: 'status',
      searchValue: '',
      visible: true,
    },
    {
      name: 'Action',
    },
  ];
  constructor(
    public dataSharedService: DataSharedService,
    private toastr: NzMessageService,
    private socketService: SocketService,
  ) {
  }
  ngOnInit(): void {
    this.loadUserData();
    this.jsonModuleList(); // To get policy list
  }


  jsonModuleList() {
    this.loader = true;

    const { jsonData, newGuid } = this.socketService.makeJsonData('Policy', 'GetModelType');
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.loader = false;

          if (res.isSuccess) {
            this.policyList = res?.data;
          }
        }
      },
      error: (err) => {
        this.loader = false;
        this.toastr.error('An error occurred', { nzDuration: 3000 });
      },
    });
    this.getUserList();
  }
  getUserList() {
    this.loader = false;
    const { jsonData, newGuid } = this.socketService.makeJsonData('users', 'GetModelType');
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.loader = false;

          if (res.isSuccess) {
            this.userList = res?.data;
          }
        }
      },
      error: (err) => {
        this.loader = false;
        this.toastr.error('An error occurred', { nzDuration: 3000 });
      },
    });
  }
  loadUserData() {
    this.loading = true;
    const { jsonData, newGuid } = this.socketService.makeJsonData('UserMapping', 'GetModelType');
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.loading = false;
          if (res.isSuccess) {
            if (res?.data.length > 0) {
              // res.data = [...res.data].reverse();
              this.listOfData = res.data;
              this.handlePageChange(1);
            }
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error(`Policy : An error occured`, { nzDuration: 3000 });
      },
    });
  }

  onSubmit() {

    if (!this.policyName || !this.userName) {
      if (!this.policyName) {
        this.toastr.warning('Please Select Policy Name', { nzDuration: 2000 });
        this.loading = false;
        return;
      }
      if (!this.userName) {
        this.toastr.warning('Please Select User', { nzDuration: 2000 });
        this.loading = false;
        return;
      }
    }
    else {
      if (this.isSubmit) {
        let findPreviousUser = this.listOfData.find(a => a.policyId == this.policyName && a.userId == this.userName);
        if (findPreviousUser) {
          this.toastr.warning('This user already assign this policy please select another.', { nzDuration: 2000 });
          this.loading = false;
          return;
        }
      }
      else {
        const findAlreadypolicyAssign = this.listOfData.find(a => a.userId == this.userName && a.policyId == this.policyName && a.id != this.editId);
        if (findAlreadypolicyAssign) {
          this.toastr.warning('This user already assign this policy please select another.', { nzDuration: 2000 });
          this.loading = false;
          return;
        }
        let findPreviousUser = this.listOfData.find(a => a.userId == this.userName && a.defaultPolicy == this.defaultPolicy && this.policyName == a.policyId);
        if (findPreviousUser) {
          this.toastr.warning('You did not change data', { nzDuration: 2000 });
          this.loading = false
          return;
        }
      }

      // if (this.defaultPolicy == true) {
      //   let defaultPolicyUsers: any[] = this.listOfData.filter(a => a.userId == this.userName && a.defaultPolicy == true && a.id != this.policyName);
      //   if (defaultPolicyUsers.length > 0) {
      //     this.toastr.warning('Already assign default.', { nzDuration: 2000 });
      //     this.loading = false;
      //     return;
      //   }
      // }
      let obj = {
        policyId: this.policyName,
        userId: this.userName,
        defaultPolicy: this.defaultPolicy,
        applicationId: this.dataSharedService.decryptedValue('applicationId'),
      }
      var ResponseGuid: any;
      if (this.isSubmit) {
        const { newGuid, metainfocreate } = this.socketService.metainfocreate();
        ResponseGuid = newGuid;
        const Add = { [`UserMapping`]: obj, metaInfo: metainfocreate }
        this.socketService.Request(Add);
      }
      else {
        const { newUGuid, metainfoupdate } = this.socketService.metainfoupdate(this.editId);
        ResponseGuid = newUGuid;
        const Update = { [`UserMapping`]: obj, metaInfo: metainfoupdate };
        this.socketService.Request(Update)
      }
      this.loading = true;
      this.socketService.OnResponseMessage().subscribe({
        next: (res: any) => {
          if (res.parseddata.requestId == ResponseGuid && res.parseddata.isSuccess) {
            res = res.parseddata.apidata;
            this.loading = false;
            if (res.isSuccess) {
              this.loadUserData();
              this.policyName = "";
              this.userName = "";
              this.defaultPolicy = false;
              this.toastr.success(res.message, { nzDuration: 3000 });
              if (!this.isSubmit) {
                this.isSubmit = true;
              }
            } else {
              this.toastr.error(res.message, { nzDuration: 3000 });
            }
          }

        },
        error: (err) => {
          this.loader = false;
          this.toastr.error(`${err.error.message}`, { nzDuration: 3000 });
        },
      });
    }
  }
  editId: any
  editItem(item: any) {
    this.editId = item.id;
    this.policyName = item.policyid;
    this.userName = item.userid;
    this.defaultPolicy = item.defaultpolicy;
    this.isSubmit = false;
  }
  deleteRow(id: any): void {
    this.loading = true;
    const { jsonData, newGuid } = this.socketService.deleteModelType('UserMapping', id);
    this.socketService.Request(jsonData);
    this.socketService.OnResponseMessage().subscribe({
      next: (res: any) => {
        if (res.parseddata.requestId == newGuid && res.parseddata.isSuccess) {
          res = res.parseddata.apidata;
          this.loading = false;
          if (res.isSuccess) {
            this.loadUserData();
            this.toastr.success(`UserMapping: ${res.message}`, { nzDuration: 2000, });
          } else this.toastr.error(`UserMapping: ${res.message}`, { nzDuration: 2000, });
        }
      },
      error: (err) => {
        this.loading = false;
        console.log(err.message)
        this.toastr.error(`UserMapping: ${err.message}`, { nzDuration: 2000, });
      },
    });

  }
  downloadJson() {
    let obj = Object.assign({}, this.listOfData);
    const blob = new Blob([JSON.stringify(obj)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'file.';
    document.body.appendChild(a);
    a.click();
  }
  searchValue(event: any, column: any): void {
    const inputValue = event?.target ? event.target.value?.toLowerCase() : event?.toLowerCase() ?? '';
    if (inputValue) {
      this.searchData = this.searchData.filter((item: any) => {
        const { key } = column;
        const { [key]: itemName } = item || {}; // Check if item is undefined, set to empty object if so
        return itemName?.toLowerCase()?.includes(inputValue); // Check if itemName is undefined or null
      });
    }
  }
  search(event?: number): void {
    let checkSearchExist = this.listOfColumns.filter(a => a.searchValue);
    if (checkSearchExist.length > 0) {
      this.searchData = this.listOfData;
      checkSearchExist.forEach(element => {
        this.searchValue(element.searchValue, element)
      });
    } else {
      this.searchData = [];
    }
    this.handlePageChange(event ? event : this.pageIndex);
  }
  handlePageChange(event: number): void {
    this.pageSize = !this.pageSize || this.pageSize < 1 ? 1 : this.pageSize
    this.pageIndex = event;
    this.startIndex = (this.pageIndex - 1) * this.pageSize;
    const start = (this.pageIndex - 1) * this.pageSize;
    this.endIndex = start + this.pageSize;
    const end = start + this.pageSize;
    this.startIndex = start == 0 ? 1 : ((this.pageIndex * this.pageSize) - this.pageSize) + 1;
    this.listOfDisplayData = this.searchData.length > 0 ? this.searchData.slice(start, end) : this.listOfData.slice(start, end);
    this.endIndex = this.listOfDisplayData.length != this.pageSize ? this.listOfData.length : this.pageIndex * this.pageSize;
  }
}
