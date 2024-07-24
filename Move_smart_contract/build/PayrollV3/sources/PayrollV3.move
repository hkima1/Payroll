module Payroll_addr::PayrollV3 {
    use Payroll_addr::ERC20TokenV3;
    use aptos_framework::event;
    use std::signer;
    use aptos_std::vector;
    use aptos_std::table::Table;
    use aptos_framework::account;


    struct Employee has key, store, copy{
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
        total_hours: u64,
        total_overtime: u64,
        total_payroll_errors: u64,
    }

    #[event]
    struct PreCheckEvent has drop, store, key {
        employee_id: u64,
        address: address,
    }

    public fun initialize(account: &signer){
        let owner_address = signer::address_of(account);
        let payroll_system = PayrollSystem {
            owner_address,
            employees: vector::empty(),
            total_hours: 0,
            total_overtime: 0,
            total_payroll_errors: 0,
        };
        move_to(account, payroll_system) // This will store the resource under the account's address
    }
    public entry fun add_employee(
        account: &signer,
        id: u64,
        address: address,
        hourly_rate: u64,
        overtime_rate: u64,
        role: vector<u8>
    ) acquires PayrollSystem  {
        let payroll = borrow_global_mut<PayrollSystem>(signer::address_of(account));
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


    public fun record_hours(
        payroll: &mut PayrollSystem,
        id: u64,
        hours_worked: u64,
        overtime_hours: u64
    ) {
        let employee = find_employee(&mut payroll.employees, id);
        employee.hours_worked = employee.hours_worked + hours_worked;
        employee.overtime_hours = employee.overtime_hours + overtime_hours;
        payroll.total_hours = payroll.total_hours + hours_worked;
        payroll.total_overtime =payroll.total_overtime + overtime_hours;
    }

     
    public fun find_employee(employees: &mut vector<Employee>, id: u64): &mut Employee {
        let length = vector::length(employees);
        let i = 0;

        while (i < length) {
            let employee = vector::borrow_mut(employees, i);
            if (employee.id == id) {
                return employee;
            };
            i = i + 1;
        };
        abort 1 // Employee not found
    }

    public fun calculate_pay(employee: &Employee): u64 {
    (employee.hours_worked * employee.hourly_rate) + (employee.overtime_hours * employee.overtime_rate)

    }

    public fun send_pre_check(payroll: &PayrollSystem, current_day: u64) {
        let length = vector::length(&payroll.employees);
        let  i = 0;
        while (i < length) {
            let employee = vector::borrow(&payroll.employees, i);

            // Emit pre-check event
            event::emit<PreCheckEvent>(
            PreCheckEvent {
                employee_id: employee.id,
                address: employee.address,
            },
        );
            i = i+ 1;
        }
    }

    public fun confirm(){

    }
    public fun confirm_employee(payroll: &mut PayrollSystem, employee_id: u64, confirmation: bool) {
        let employee = find_employee(&mut payroll.employees, employee_id);
        employee.confirmed = confirmation;
    }

    public fun confirm_and_pay(payroll: &mut PayrollSystem, token: &mut ERC20TokenV3::Token, payer: &signer, current_day: u64) {
        let length = vector::length(&payroll.employees);
        let i = 0;
        while (i < length) {
            let employee = vector::borrow_mut(&mut payroll.employees, i);
            if (employee.confirmed && employee.last_paid_day != current_day) {
                let pay = calculate_pay(employee);
                ERC20TokenV3::transfer(token, payer, employee.address, pay);
                employee.hours_worked = 0; // Reset hours worked after payment
                employee.overtime_hours = 0; // Reset overtime hours after payment
                employee.last_paid_day = current_day; // Update last paid day
                employee.confirmed = false; // Reset confirmation status
            };
            i = i+ 1;
        }
    }

    public fun get_employees_by_role(payroll: &PayrollSystem, role: vector<u8>): vector<Employee> {
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

    public fun pay_employee(payer: &signer, payee: &address, amount: u64) {
        // Function to pay employee (can be kept for other payment mechanisms)
    }
    
    #[view]
    public fun get_employee_characteristics(account_address: address): Employee acquires PayrollSystem {
        let payroll = borrow_global<PayrollSystem>(account_address);
        let length = vector::length(&payroll.employees);
        let i = 0;

        while (i < length) {
            let employee = vector::borrow(&payroll.employees, i);
            if (employee.address == account_address) {
                return *employee;
            };
            i = i + 1;
        };

        abort 1 // Employee not found
    }

}

