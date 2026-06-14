export const getErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data;
  if (data?.message) return data.message;
  if (data?.errors?.length) {
    return data.errors.map((e) => e.msg || e.message).join('. ');
  }
  return fallback;
};
