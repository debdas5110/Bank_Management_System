
import { useEffect, useRef } from 'react';
import { useNotifications } from './useNotifications';
import { useBankData } from './useBankData';

export const useTransactionNotifications = () => {
  const { sendNotification } = useNotifications();
  const { transactions, transfers } = useBankData();
  const lastTransactionRef = useRef<string | null>(null);
  const lastTransferRef = useRef<string | null>(null);

  // Send notifications for new transactions
  useEffect(() => {
    if (transactions.length > 0) {
      const latestTransaction = transactions[0];
      
      // Only notify if this is a new transaction (different from last one we processed)
      if (lastTransactionRef.current !== latestTransaction.id) {
        console.log('New transaction detected:', latestTransaction);
        
        const eventType = latestTransaction.transaction_type === 'transfer_in' || latestTransaction.transaction_type === 'transfer_out' 
          ? latestTransaction.transaction_type 
          : 'transaction';
        
        const title = getTransactionTitle(latestTransaction.transaction_type, latestTransaction.amount);
        const message = `${latestTransaction.description}. New balance: ₹${Number(latestTransaction.balance_after).toLocaleString('en-IN')}`;
        
        sendNotification(eventType, title, message, {
          transaction_id: latestTransaction.id,
          amount: latestTransaction.amount,
          type: latestTransaction.transaction_type
        });
        
        lastTransactionRef.current = latestTransaction.id;
      }
    }
  }, [transactions, sendNotification]);

  // Send notifications for new transfers
  useEffect(() => {
    if (transfers.length > 0) {
      const latestTransfer = transfers[0];
      
      // Only notify if this is a new transfer (different from last one we processed)
      if (lastTransferRef.current !== latestTransfer.id) {
        console.log('New transfer detected:', latestTransfer);
        
        const title = `Transfer of ₹${Number(latestTransfer.amount).toLocaleString('en-IN')} ${latestTransfer.status}`;
        const message = `${latestTransfer.description || 'Money transfer'} - Account: ${latestTransfer.to_account_number}`;
        
        sendNotification('transfer_out', title, message, {
          transfer_id: latestTransfer.id,
          amount: latestTransfer.amount,
          to_account: latestTransfer.to_account_number
        });
        
        lastTransferRef.current = latestTransfer.id;
      }
    }
  }, [transfers, sendNotification]);
};

const getTransactionTitle = (type: string, amount: number) => {
  const formattedAmount = `₹${Number(amount).toLocaleString('en-IN')}`;
  
  switch (type) {
    case 'deposit':
      return `Deposit of ${formattedAmount} successful`;
    case 'withdrawal':
      return `Withdrawal of ${formattedAmount} completed`;
    case 'transfer_in':
      return `Received ${formattedAmount}`;
    case 'transfer_out':
      return `Sent ${formattedAmount}`;
    default:
      return `Transaction of ${formattedAmount}`;
  }
};
