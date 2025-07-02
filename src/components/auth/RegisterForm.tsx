import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { countries } from '../../utils/countries'; // Lista de países
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaChevronDown } from 'react-icons/fa';
import { searchCountries } from '../../utils/countrySearch';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const { register } = useAuthStore();
  const navigate = useNavigate(); 

  const validateName = (value: string) => {
    if (!value) return 'El nombre es obligatorio';
    return '';
  };

  const validateEmail = (value: string) => {
    if (!value) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'El email no es válido';
    return '';
  };

  const validatePhone = (value: string, selectedCountry: string) => {
    const country = countries.find((c) => c.dial_code === selectedCountry);
    if (!country) return 'País no válido';
    if (!value) return 'El número de teléfono es obligatorio';
    if (value.length !== country.digits) return `El número de teléfono debe tener ${country.digits} dígitos`;
    return '';
  };

  const validatePassword = (value: string) => {
    if (!value) return 'La contraseña es obligatoria';
    if (value.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (!/[A-Z]/.test(value)) return 'La contraseña debe tener al menos una mayúscula';
    if (!/[0-9]/.test(value)) return 'La contraseña debe tener al menos un número';
    if (!/[!@#$%^&*(),.?]/.test(value)) return 'La contraseña debe tener al menos un carácter especial';
    return '';
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) return 'Debes confirmar la contraseña';
    if (value !== password) return 'Las contraseñas no coinciden';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const phoneError = validatePhone(phone, selectedCountry);
    const passwordError = validatePassword(password);
    const confirmPasswordError = validateConfirmPassword(confirmPassword);

    setErrors({
      name: nameError,
      email: emailError,
      phone: phoneError,
      password: passwordError,
      confirmPassword: confirmPasswordError,
    });

    if (nameError || emailError || phoneError || passwordError || confirmPasswordError) {
      return;
    }

    await register({ name, email, phone: `${selectedCountry}${phone}`, password });
    navigate('/verify-email', { state: { email } });
  };

  // Nuevo código usando searchCountries
const filteredCountries = searchCountry ? searchCountries(searchCountry) : countries.slice(0, 10);

  const isPasswordValid = password.length >= 6 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*(),.?]/.test(password);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-gray-700 mb-1">Nombre</label>
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors({ ...errors, name: validateName(e.target.value) });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre"
          />
          <FaUser className="absolute right-3 top-3 text-gray-400" />
        </div>
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-gray-700 mb-1">Email</label>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors({ ...errors, email: validateEmail(e.target.value) });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
              errors.email ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Email"
          />
          <FaEnvelope className="absolute right-3 top-3 text-gray-400" />
        </div>
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-gray-700 mb-1">Número de Teléfono</label>
        <div className="flex items-center">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCountryList(!showCountryList)}
              className="px-4 py-2 border rounded-lg focus:outline-none flex items-center"
            >
              {selectedCountry || 'país'}
              <FaChevronDown className="ml-2" />
            </button>
            {showCountryList && (
              <div className="w-[400%] absolute mt-2 bg-white border rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <input
                    type="text"
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                    placeholder="Buscar país"
                  />
                </div>
                <ul className="max-h-40 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <li
                      key={country.code}
                      onClick={() => {
                        setSelectedCountry(country.dial_code);
                        setShowCountryList(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      {country.dial_code} - {country.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="relative ml-2 flex-1">
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors({ ...errors, phone: validatePhone(e.target.value, selectedCountry) });
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Número de Teléfono"
            />
            <FaPhone className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      {/* Contraseña */}
      <div>
        <label className="block text-gray-700 mb-1">Contraseña</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors({ ...errors, password: validatePassword(e.target.value) });
            }}
            onFocus={() => setShowPasswordRequirements(true)}
            onBlur={() => {
              if (isPasswordValid) setShowPasswordRequirements(false);
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
              errors.password ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Contraseña"
          />
          <FaLock className="absolute right-10 top-3 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        {showPasswordRequirements && !isPasswordValid && (
          <div className="mt-2 text-sm text-gray-600">
            <ul>
              <li className={password.length >= 6 ? 'text-green-500' : 'text-red-500'}>
                Al menos 6 caracteres
              </li>
              <li className={/[A-Z]/.test(password) ? 'text-green-500' : 'text-red-500'}>
                Al menos una mayúscula
              </li>
              <li className={/[0-9]/.test(password) ? 'text-green-500' : 'text-red-500'}>
                Al menos un número
              </li>
              <li className={/[!@#$%^&*(),.?]/.test(password) ? 'text-green-500' : 'text-red-500'}>
                Al menos un carácter especial (.,!@#$%^&*())
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div>
        <label className="block text-gray-700 mb-1">Confirmar Contraseña</label>
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors({ ...errors, confirmPassword: validateConfirmPassword(e.target.value) });
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none ${
              errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Confirmar Contraseña"
          />
          <FaLock className="absolute right-10 top-3 text-gray-400" />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-3 text-gray-400"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
      </div>

      {/* Botón de Registro */}
      <button
        type="submit"
        className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors"
      >
        Registrarse
      </button>
    </form>
  );
};

export default RegisterForm;