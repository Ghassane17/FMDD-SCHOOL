import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const BankInfoForm = ({ data, updateData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData({ ...data, [name]: value });
  };

  const handleSelectChange = (value) => {
    updateData({ ...data, paymentMethod: value });
  };

  const paymentMethods = [
    "Virement bancaire"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-3xl font-bold mb-5 text-gray-800">Informations bancaires (optionnel)</h3>
        <p className="text-xl text-gray-600 mb-8">
          Ces informations nous permettront de vous verser vos commissions. 
          Vous pouvez les ajouter maintenant ou plus tard dans votre profil.
        </p>
        
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-6">
              <div>
                <Label htmlFor="iban" className="text-xl mb-3 block">IBAN</Label>
                <Input
                  id="iban"
                  name="iban"
                  value={data.iban}
                  onChange={handleChange}
                  placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                  className="text-lg h-14 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="bankName" className="text-xl mb-3 block">Nom de la banque</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={data.bankName}
                  onChange={handleChange}
                  placeholder="Ex: Crédit Agricole"
                  className="text-lg h-14 transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              
              <div>
                <Label htmlFor="paymentMethod" className="text-xl mb-3 block">Méthode de paiement</Label>
                <Select value={data.paymentMethod} onValueChange={handleSelectChange}>
                  <SelectTrigger id="paymentMethod" className="h-14 text-lg transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                    <SelectValue placeholder="Sélectionnez une méthode de paiement" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-gray-200 rounded-lg shadow-lg">
                    {paymentMethods.map((method) => (
                      <SelectItem 
                        key={method} 
                        value={method} 
                        className="text-lg py-3 px-4 cursor-pointer hover:bg-gray-100 focus:bg-gray-100 focus:text-primary data-[state=checked]:bg-gray-100 data-[state=checked]:text-primary"
                      >
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BankInfoForm;
