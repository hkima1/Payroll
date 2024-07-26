module Payroll_addr::PayrollV5 {
    use Payroll_addr::ERC20TokenV5;
    use aptos_framework::event;
    use std::signer;
    use aptos_std::vector;
    use std::string::String;
    use aptos_std::table::Table;
    use aptos_framework::account;

    const E_NOT_OWNER: u64 = 1; // Error code for "not owner"
    const E_EMPLOYEE_NOT_FOUND: u64 = 404;
    const E_NOT_AUTHORIZED: u64 = 403;


    // Variables 

    struct Employee has store, copy{
        id: u64,
        address: address,
        hourly_rate: u64,
        overtime_rate: u64,
        hours_worked: u64,
        overtime_hours: u64,
        attendance: u64,
        turnover: u64,
        payroll_errors: u64,
        last_paid_day: u64, // Keeps track of the last day the employee was paid
        role: vector<u8>, // Describe the employee's role
        confirmed: bool, // New property to store confirmation status
    }

    struct PayrollSystem has key{
        owner_address: address,
        employees: vector<Employee>,
        pre_check_events: vector<PreCheckEvent>,
        total_hours: u64,
        total_overtime: u64,
        total_payroll_errors: u64,
    }

    struct Notification  has copy, drop, store {
        message: vector<u8>,
        timestamp: u64,
    }

    struct NotificationList has key {
        notifications: vector<Notification>,
    }


      #[event]
    struct PreCheckEvent has drop, store, key {
        employee_id: u64,
        address: address,
        content: vector<u8>,
    }


    // Initialization Function

    public entry fun initialize(account: &signer){
        let owner_address = signer::address_of(account);
        let payroll_system = PayrollSystem {
            owner_address,
            employees: vector::empty(),
            pre_check_events: vector::empty<PreCheckEvent>(),
            total_hours: 0,
            total_overtime: 0,
            total_payroll_errors: 0,
        };
        move_to<PayrollSystem>(account, payroll_system);  // This will store the resource under the account's address
    }


    

    // Organazation functions

    public entry fun add_employee(
        account: &signer,
        id: u64,
        address: address,
        hourly_rate: u64,
        overtime_rate: u64,
        role: vector<u8>
    ) acquires PayrollSystem  {
        let caller_address = signer::address_of(account);
        let payroll = borrow_global_mut<PayrollSystem>(caller_address);
         assert!(payroll.owner_address == caller_address, E_NOT_OWNER);
        let employee = Employee {
            id,
            address,
            hourly_rate,
            overtime_rate,
            hours_worked: 0,
            overtime_hours: 0,
            attendance: 0,
            turnover: 0,
            payroll_errors: 0,
            last_paid_day: 0,
            role, // Initialize role
            confirmed: false, // Initialize confirmation status
        };
        vector::push_back(&mut payroll.employees, employee);
    }

    // Searching for employer by their work ::

     #[view]
    public fun get_employees_by_role( role: vector<u8>): vector<Employee> acquires PayrollSystem {
        let payroll = borrow_global_mut<PayrollSystem>(account_address);
        let employees_with_role = vector::empty<Employee>();
        let length = vector::length(&payroll.employees);
        let i = 0;
        while (i < length) {
            let employee = vector::borrow(&payroll.employees, i);
            if (employee.role == role) {
                vector::push_back(&mut employees_with_role, *employee);
            };
            i = i+1;
        };
        employees_with_role
    }

    public fun find_employee(employees: &mut vector<Employee>, id: u64): &mut Employee {
        let length = vector::length(employees);
        let i = 0;

        while (i < length) {
            let employee = vector::borrow_mut(employees, i);
            if (employee.id == id) {
                return employee
            };
            i = i + 1;
        };
        abort 1 // Employee not found
    }

    public entry fun record_hours(
        account: &signer,
        id: u64,
        hours_worked: u64,
        overtime_hours: u64
    ) acquires PayrollSystem{
        let caller_address = signer::address_of(account);
        let payroll = borrow_global_mut<PayrollSystem>(caller_address);
        assert!(payroll.owner_address == caller_address, E_NOT_OWNER);
        let employee = find_employee(&mut payroll.employees, id);
        employee.hours_worked = employee.hours_worked + hours_worked;
        employee.overtime_hours = employee.overtime_hours + overtime_hours;
        payroll.total_hours = payroll.total_hours + hours_worked;
        payroll.total_overtime =payroll.total_overtime + overtime_hours;
    }

     
   

    // Payment Calculation ::

    public fun calculate_pay(employee: &Employee): u64 {
    (employee.hours_worked * employee.hourly_rate) + (employee.overtime_hours * employee.overtime_rate)
    }

    // Notify Employees to check their balances before payment  ::

    

    // Function to send all PreCheckEvents
    public entry fun send_pre_check( account: &signer,current_day: u64, msg: vector<u8>) acquires PayrollSystem {
        let caller_address = signer::address_of(account);
        let payroll = borrow_global_mut<PayrollSystem>(caller_address);
        assert!(payroll.owner_address == caller_address, E_NOT_OWNER);
            let length = vector::length(&payroll.employees);
            let  i = 0;
            while (i < length) {
                let employee = vector::borrow(&payroll.employees, i);

                // Emit pre-check event
                event::emit<PreCheckEvent>(
                PreCheckEvent {
                    employee_id: employee.id,
                    address: employee.address,
                    content: msg,
                },
            );
                i = i+ 1;
            }
        }

    // Sending Tokens to Employees
    /*public entry fun confirm_and_pay(account:&signer, payer: &signer, current_day: u64) acquires PayrollSystem{
        let caller_address = signer::address_of(account);
        let payroll = borrow_global_mut<PayrollSystem>(caller_address); // Moved this line up
        let length = vector::length<Employee>(&payroll.employees); // Assuming Employee is the type
        assert!(payroll.owner_address == caller_address, E_NOT_OWNER);
        let token = ERC20TokenV5::borrow_token(account);
        let i = 0;
        while (i < length) {
            let employee = vector::borrow_mut(&mut payroll.employees, i);
            if (employee.confirmed && employee.last_paid_day != current_day) {
                let pay = calculate_pay(employee);
                ERC20TokenV5::transfer(token, payer, employee.address, pay);
                employee.hours_worked = 0; // Reset hours worked after payment
                employee.overtime_hours = 0; // Reset overtime hours after payment
                employee.last_paid_day = current_day; // Update last paid day
                employee.confirmed = false; // Reset confirmation status
            };
            i = i+ 1;
        }
    }*/
    

    // Paying Employees by crypto if needed (just function abstract)  ::

    public fun pay_employee(payer: &signer, payee: &address, amount: u64) {
        // Function to pay employee (can be kept for other payment mechanisms)
    }
    
    // Notify Employee 
    public fun create_notification_list(account: &signer) {
        let notification_list = NotificationList {
            notifications: vector::empty<Notification>(),
        };
        move_to(account, notification_list);
    }

    public fun add_notification(account: &signer, message: vector<u8>, timestamp: u64) acquires NotificationList {
        let notification_list = borrow_global_mut<NotificationList>(signer::address_of(account));
        let notification = Notification {
            message: message,
            timestamp: timestamp,
        };
        vector::push_back(&mut notification_list.notifications, notification);
    }

    public fun get_notifications(account: &signer): vector<Notification> acquires NotificationList {
        let notification_list = borrow_global<NotificationList>(signer::address_of(account));
        notification_list.notifications
    }
    



    // Employees function ::::

    // Get employ characteristics 

    #[view]
    public fun get_employee_characteristics(account_address: address): Employee acquires PayrollSystem {
        let payroll = borrow_global<PayrollSystem>(account_address);
        let length = vector::length(&payroll.employees);
        let i = 0;

        while (i < length) {
            let employee = vector::borrow(&payroll.employees, i);
            if (employee.address == account_address) {
                return *employee
            };
            i = i + 1;
        };

        abort 1 // Employee not found
    }

    // Employee Confirmation 
    
    public entry fun confirm_employee(account: &signer, confirmation: bool) acquires PayrollSystem {
        let signer_address = signer::address_of(account);
        let payroll_system = borrow_global_mut<PayrollSystem>(signer_address);
        let employees = &mut payroll_system.employees;
        let len = vector::length(employees);
        let index = 0;

        while (index < len) {
            let employee = vector::borrow_mut(employees, index);
            if (employee.address == signer_address) {
                // The signer's address matches the employee's address
                employee.confirmed = confirmation;
                return
            };
            index = index + 1;
        };

        abort(E_EMPLOYEE_NOT_FOUND) // Employee not found
    }



}

