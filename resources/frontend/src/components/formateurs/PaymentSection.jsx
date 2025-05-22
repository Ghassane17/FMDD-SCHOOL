import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateInstructorBankAccount } from '../../services/api_instructor';
import { toast } from 'react-hot-toast';

const PaymentSection = ({ payments = [], bankInfo = null, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [editedBankInfo, setEditedBankInfo] = useState({
    iban: '',
    bankName: bankInfo?.bankName || '',
    paymentMethod: bankInfo?.paymentMethod || ''
  });

  // Function to mask IBAN
  const maskIBAN = (iban) => {
    if (!iban) return '';
    if (iban.length <= 8) return iban;
    const firstFour = iban.substring(0, 4);
    const lastFour = iban.substring(iban.length - 4);
    const masked = '*'.repeat(iban.length - 8);
    return `${firstFour}${masked}${lastFour}`;
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // If IBAN is empty and we have existing bank info, use the existing IBAN
      const dataToSubmit = {
        ...editedBankInfo,
        iban: editedBankInfo.iban || bankInfo?.iban
      };
      const response = await updateInstructorBankAccount({ bank_info: dataToSubmit });
      
      // Update the parent component with new data
      if (onUpdate) {
        onUpdate(response.bank_info);
      }
      
      // Show success state
      setShowSuccess(true);
      toast.success('Informations bancaires mises à jour avec succès');

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setIsModalOpen(false);
      }, 2000);

    } catch (error) {
      console.error('Error updating bank info:', error);
      toast.error('Erreur lors de la mise à jour des informations bancaires');
    } finally {
      setIsLoading(false);
    }
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
                <p className="font-medium">{maskIBAN(bankInfo.iban)}</p>
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
                  placeholder={bankInfo ? maskIBAN(bankInfo.iban) : "Entrez votre IBAN"}
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
                  disabled={isLoading || showSuccess}
                  className="px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading || showSuccess}
                  className={`px-6 py-3 text-base font-medium text-white rounded-md flex items-center gap-2 ${
                    showSuccess 
                      ? 'bg-green-600'
                      : 'bg-blue-600 hover:bg-blue-700'
                  } disabled:opacity-50`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Enregistrement...
                    </>
                  ) : showSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Enregistré !
                    </>
                  ) : (
                    'Enregistrer'
                  )}
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
