const onlyDigits = (v: string) => v.replace(/\D/g, "");

export const formatPhone = (value: string) => {
    const d = onlyDigits(value).slice(0, 11);
    if (d.length <= 10) {
      return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
    } else {
      return d.replace(/^(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
    }
  };