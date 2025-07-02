import { useState } from 'react';
import { verifyCode } from '../../services/auth.service';
import { useLocation } from 'react-router-dom';

const VerifyEmailForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(''); 
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await verifyCode(code, email); // Llamar al backend para verificar el código
      console.log('datos enviados', code, email);
      onSuccess();  // Redirigir al dashboard
    } catch (error) {
      setError('Código inválido o expirado');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700">Código de Verificación</label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
          required
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors"
      >
        Verificar
      </button>
    </form>
  );
};

export default VerifyEmailForm;