# Security Specification for Zacma Technology Training Center

## 1. Data Invariants
1. User profiles in `/users/{userId}` are keyed by Firebase Auth UID. Clients cannot grant themselves or escalate to privileged roles (`super_admin`, `admin`, `accountant`, `secretary`, `teacher`).
2. Students can view only their own user profile and records.
3. Courses, schedules, and packages are readable by everyone, but can only be modified by administrators.
4. Registrations can be created with initial status `pending_payment`. Only accountants and administrators can update payment and enrollment statuses.
5. Payment transactions require server or accountant verification. A student submitting a transaction reference cannot set `status: 'verified'` or issue their own receipt.
6. Receipts are generated only upon verified payments and are immutable.
7. Certificates are publicly verifiable by verification code, but can only be created or revoked by administrators and teachers.
8. Attendance records can only be created and updated by teachers and administrators.
9. Audit logs are append-only by authorized users or system endpoints.

## 2. Dirty Dozen Attack Payloads
1. **Self-Escalation Attack**: Student client attempts to update `/users/{uid}` with `role: 'super_admin'`. -> Must return PERMISSION_DENIED.
2. **Ghost Payment Self-Verification**: Student client attempts to create `/payments/{id}` with `status: 'verified'` and `receiptNumber: 'REC-9999'`. -> Must return PERMISSION_DENIED.
3. **Tuition Tampering**: Public registration attempts to set `totalFee: 0` and `balanceDue: 0`. -> Must return PERMISSION_DENIED.
4. **Foreign Profile Snooping**: Student A attempts to read `/users/{studentB_uid}`. -> Must return PERMISSION_DENIED.
5. **Course Price Forgery**: Non-admin user attempts to update `/courses/{courseId}` with `baseFee: 100`. -> Must return PERMISSION_DENIED.
6. **Attendance Tampering**: Student attempts to overwrite `/attendance/{id}` to change status to `present`. -> Must return PERMISSION_DENIED.
7. **Certificate Injection**: Unauthenticated visitor attempts to write a fake certificate into `/certificates/{id}`. -> Must return PERMISSION_DENIED.
8. **Receipt Deletion**: Accountant or user attempts to delete a finalized `/receipts/{id}`. -> Must return PERMISSION_DENIED.
9. **Oversized Field Denial of Wallet**: Attacker submits a 2MB payload into `specialRequirements`. -> Must return PERMISSION_DENIED.
10. **ID Poisoning Attack**: Submitting 1.5KB string as document ID. -> Must return PERMISSION_DENIED.
11. **Refund Abuse**: Student attempts to flag their own payment as `refunded`. -> Must return PERMISSION_DENIED.
12. **Audit Log Erasure**: Attacker attempts to delete or alter `/auditLogs/{id}`. -> Must return PERMISSION_DENIED.
