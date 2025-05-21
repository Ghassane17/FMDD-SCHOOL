import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PaymentSection = ({ payments = [], bankInfo = null }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedBankInfo, setEditedBankInfo] = useState(bankInfo || {
    iban: '',
    bankName: '',
    paymentMethod: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedBankInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value) => {
    setEditedBankInfo(prev => ({
      ...prev,
      paymentMethod: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to update the bank info
    console.log('Updated bank info:', editedBankInfo);
    setIsModalOpen(false);
  };

  const paymentMethods = ["Virement bancaire"];

  return (
    <>
      {/* Bank Information */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Informations bancaires</h2>
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          {bankInfo ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">IBAN</p>
                <p className="font-medium">{bankInfo.iban}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Banque</p>
                <p className="font-medium">{bankInfo.bankName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Méthode de paiement</p>
                <p className="font-medium">{bankInfo.paymentMethod}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Aucune information bancaire disponible.
            </p>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 text-blue-600 font-medium hover:text-blue-800 flex items-center justify-center cursor-pointer"
          >
            Modifier mes informations bancaires
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-[2px] bg-black/25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-xl">
            <h3 className="text-2xl font-bold mb-6">Modifier les informations bancaires</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  name="iban"
                  value={editedBankInfo.iban}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Nom de la banque
                </label>
                <input
                  type="text"
                  name="bankName"
                  value={editedBankInfo.bankName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <Select value={editedBankInfo.paymentMethod} onValueChange={handleSelectChange}>
                  <SelectTrigger className="w-full h-12 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Sélectionnez une méthode de paiement" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                    {paymentMethods.map((method) => (
                      <SelectItem 
                        key={method} 
                        value={method} 
                        className="text-base py-3 px-4 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:text-primary data-[state=checked]:bg-gray-100 data-[state=checked]:text-primary"
                      >
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Historique des paiements</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                {['Date', 'Description', 'Montant', 'Actions'].map((label) => (
                  <th
                    key={label}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments?.length > 0 ? (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {typeof payment.amount === 'number'
                        ? payment.amount.toFixed(2)
                        : payment.amount}{' '}
                      €
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <button className="text-blue-600 hover:text-blue-800">
                        Facture
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    Aucun paiement trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default PaymentSection;
