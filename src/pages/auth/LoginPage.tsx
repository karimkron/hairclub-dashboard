import { useState } from 'react';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg w-96">
        {/* Botones de alternar entre Login y Registro */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-6 py-3 text-sm font-medium rounded-full transition-colors ${
              isLogin
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`px-6 py-3 text-sm font-medium rounded-full transition-colors ${
              !isLogin
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Formulario de Login o Registro */}
        {isLogin ? <LoginForm /> : <RegisterForm />}

        {/* Enlace de Recuperar Contraseña (solo en el formulario de login) */}
        {isLogin && (
          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="text-sm text-amber-600 hover:text-amber-700 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;