
import React from 'react';
import { trainerData } from '../../data/trainerData';

const PaymentSection = () => {
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Informations bancaires</h2>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">IBAN</p>
              <p className="font-medium">{trainerData.bankInfo.iban}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Banque</p>
              <p className="font-medium">{trainerData.bankInfo.bankName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Méthode de paiement</p>
              <p className="font-medium">{trainerData.bankInfo.paymentMethod}</p>
            </div>
          </div>
          
          <button className="mt-4 text-blue-600 font-medium hover:text-blue-800">
            Modifier mes informations bancaires
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Historique des paiements</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trainerData.paymentHistory.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{payment.amount.toFixed(2)} €</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    <button className="text-blue-600 hover:text-blue-800">Facture</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PaymentSection;
