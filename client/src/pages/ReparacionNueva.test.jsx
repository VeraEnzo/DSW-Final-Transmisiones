import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ReparacionNueva from './ReparacionNueva';
import api from '../api/axios';

// 1. Mockeamos las dependencias externas (API, Router y Contexto de Auth)
vi.mock('../api/axios');

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { nombre: 'Técnico Test' } }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '1' }), // Simulamos que estamos en /cajas/1
    useNavigate: () => mockNavigate,
  };
});

describe('Componente ReparacionNueva', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Simulamos las respuestas de la API al montar el componente
    api.get.mockImplementation((url) => {
      if (url === '/cajas/1') {
        return Promise.resolve({ data: { data: { numero_serie: 'CAJA-123' } } });
      }
      if (url === '/usuarios') {
        return Promise.resolve({ data: { data: [{ id: 1, nombre: 'Técnico Test' }] } });
      }
      return Promise.reject(new Error('Ruta no mockeada'));
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ReparacionNueva />
      </BrowserRouter>
    );
  };

  it('debe renderizar correctamente todos los campos del formulario', async () => {
    renderComponent();

    // Verificamos el título
    expect(screen.getByText('Nueva Reparación')).toBeInTheDocument();
    
    // Esperamos a que el useEffect traiga los datos mockeados de la caja
    expect(await screen.findByText('CAJA-123')).toBeInTheDocument();

    // Verificamos que los inputs existan
    expect(screen.getByLabelText(/Fecha de ingreso/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Técnico a cargo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Falla declarada por el cliente/i)).toBeInTheDocument();
    
    // Verificamos que el botón de submit esté presente
    expect(screen.getByRole('button', { name: /Iniciar reparación/i })).toBeInTheDocument();
  });

  it('el campo Fecha de ingreso debe ser obligatorio y el botón no debe estar deshabilitado inicialmente', async () => {
    renderComponent();
    
    // Esperamos a que resuelvan las llamadas a la API para evitar advertencias de "act"
    await screen.findByText('CAJA-123');

    const fechaInput = screen.getByLabelText(/Fecha de ingreso/i);
    
    // Verificamos la validación HTML5
    expect(fechaInput).toBeRequired();
    
    // El botón solo debe deshabilitarse cuando está guardando, no por campos vacíos
    const submitButton = screen.getByRole('button', { name: /Iniciar reparación/i });
    expect(submitButton).not.toBeDisabled();
  });
});