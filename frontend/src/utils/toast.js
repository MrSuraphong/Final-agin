import Swal from 'sweetalert2';

export const showSuccess = (title, text) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'success',
    background: '#fff',
    color: '#1a1a1a',
    confirmButtonColor: '#2563eb', // สีน้ำเงิน Blue-600
    borderRadius: '2rem',
    customClass: {
      popup: 'rounded-[2.5rem] font-sans',
      confirmButton: 'rounded-2xl px-8 py-3 font-black uppercase tracking-widest text-sm'
    }
  });
};

export const showError = (title, text) => {
  Swal.fire({
    title: title,
    text: text,
    icon: 'error',
    confirmButtonColor: '#ef4444',
  });
};