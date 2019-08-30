import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ClientsService } from 'src/services/clients/clients.service';
import { Client } from 'src/models/client.model';

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
    private clientsService: ClientsService
  ) { }

  ngOnInit() {

    this.clientsService.getClients().subscribe(res => {
      this.clients = res;
      this.filteredClients = this.clients;
      
    });

  }
  toCreate() {
    this.router.navigate(['/create-clients']);
  }

  filterClients(filterValue: string): void {
    this.clients = this.filteredClients.filter(client => client.id.toString().toLowerCase().indexOf(filterValue.toLowerCase()) > -1);
  }

  toDetails(idClient: string): void {
    this.router.navigate([`/clients-detail/${idClient}`]);
  }


}
