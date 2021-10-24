export class Customer {
    'userId': number;
    'email': string;
    'name': string;
    'password': string;
    'image': string;
    'address': string;
    'phone': string;
    'gender': boolean;
    'registerDate': Date;
    'status': boolean;
    'role': boolean;

    constructor(id: number) {
        this.userId = id;
    }
}
