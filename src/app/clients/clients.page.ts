import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientsService } from 'src/services/clients/clients.service';
import { Client } from 'src/models/client.model';
import { UsersService } from 'src/services/users/users.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.page.html',
  styleUrls: ['./clients.page.scss'],
})
export class ClientsPage implements OnInit {

  clients: Client[];
  filteredClients: Client[];


  constructor(
    private router: Router,
    private clientsService: ClientsService,
    private usersSerivice: UsersService
  ) { }

  ngOnInit() {

    const idCompany = Number(this.usersSerivice.getStorageData('idCompany'));
    this.clientsService.getClients(idCompany).subscribe(res => {
      this.clients = res.filter(client => client != null);
      this.filteredClients = this.clients;
    });

  }
  
  toCreate() {
    this.router.navigate(['/create-clients']);
  }

  filterClients(filterValue: string): void {
    this.filteredClients.filter(client => client.fullName.toLowerCase().indexOf(filterValue.toLowerCase()) > -1);
  }

  toDetails(idClient: string): void {
    this.router.navigate([`/clients-detail/${idClient}`]);
  }


}
