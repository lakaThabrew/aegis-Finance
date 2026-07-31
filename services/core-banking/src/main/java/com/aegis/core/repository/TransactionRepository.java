package com.aegis.core.repository;

import com.aegis.core.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransactionRepository extends JpaRepository<Transaction, UUID> {
    Optional<Transaction> findByIdempotencyKey(String idempotencyKey);
    Optional<Transaction> findByReference(String reference);

    /**
     * Loads the account relationships used by the API response in the same query.
     * Without the fetch joins Jackson tries to initialize the lazy relationships
     * after the repository call has completed, which results in a 500 response.
     */
    @Query("""
            SELECT DISTINCT t FROM Transaction t
            LEFT JOIN FETCH t.senderAccount
            LEFT JOIN FETCH t.receiverAccount
            WHERE t.senderAccount.customerId = :customerId
               OR t.receiverAccount.customerId = :customerId
            ORDER BY t.createdAt DESC
            """)
    List<Transaction> findForCustomerWithAccounts(@Param("customerId") String customerId);

    @Query("""
            SELECT DISTINCT t FROM Transaction t
            LEFT JOIN FETCH t.senderAccount
            LEFT JOIN FETCH t.receiverAccount
            ORDER BY t.createdAt DESC
            """)
    List<Transaction> findAllWithAccounts();

    /**
     * Approval and rejection responses include both account objects. Fetch them
     * while the transaction is open so Jackson never has to initialize a lazy
     * proxy after the response has started.
     */
    @Query("""
            SELECT t FROM Transaction t
            LEFT JOIN FETCH t.senderAccount
            LEFT JOIN FETCH t.receiverAccount
            WHERE t.id = :id
            """)
    Optional<Transaction> findByIdWithAccounts(@Param("id") UUID id);
}
