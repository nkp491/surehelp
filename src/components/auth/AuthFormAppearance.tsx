import { ThemeSupa } from "@supabase/auth-ui-shared";

export const getAuthFormAppearance = () => ({
  theme: ThemeSupa,
  style: {
    container: {
      width: '100%',
    },
    button: {
      width: '100%',
      padding: '8px 16px',
      backgroundColor: '#2A6F97',
      color: 'white',
      borderRadius: '6px',
      fontWeight: '500',
    },
    input: {
      width: '100%',
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
    },
    message: {
      width: '100%',
      margin: '8px 0',
    },
    anchor: {
      width: '100%',
      color: '#2A6F97',
      textDecoration: 'none',
    },
    divider: {
      width: '100%',
      margin: '16px 0',
    },
    label: {
      width: '100%',
      marginBottom: '4px',
      color: '#4b5563',
      fontSize: '0.875rem',
    }
  },
  variables: {
    default: {
      colors: {
        brand: '#2A6F97',
        brandAccent: '#2A6F97',
      },
    },
  },
  className: {
    container: 'flex flex-col gap-4',
    button: 'w-full hover:bg-[#2A6F97]/90 transition-colors',
    input: 'w-full rounded-md focus:ring-2 focus:ring-[#2A6F97]/20 focus:border-[#2A6F97]',
    message: 'w-full text-sm',
    anchor: 'text-[#2A6F97] hover:text-[#2A6F97]/80 transition-colors',
    divider: 'w-full bg-gray-200',
    label: 'block w-full mb-1 text-sm font-medium text-gray-700'
  },
});