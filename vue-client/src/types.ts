export interface InputFieldProps {
  type: 'text' | 'password' | 'email' | 'number';
  name: string;
  id: string;
  placeholder?: string;
  required?: boolean;
  class?: string;
}

export interface LabelProps {
  for: string;
  text: string;
  class?: string;
}

export const defaultInputClass = 'bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500';

export const defaultLabelClass = 'block mb-2 text-sm font-medium text-gray-900 dark:text-white';