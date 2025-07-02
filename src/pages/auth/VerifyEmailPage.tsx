import { useNavigate } from 'react-router-dom';
import VerifyEmailForm from '../../components/auth/VerifyEmailForm';

const VerifyEmailPage = () => {
  const navigate = useNavigate();

  const handleVerificationSuccess = () => {
    navigate('/dashboard'); // Redirigir al dashboard después de la verificación
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Verifica tu Correo Electrónico</h2>
        <VerifyEmailForm onSuccess={handleVerificationSuccess} />
      </div>
    </div>
  );
};

export default VerifyEmailPage;