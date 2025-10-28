const onlyDigits = (v: string) => v.replace(/\D/g, "");

export const formatCPF = (value: string) => {
    const d = onlyDigits(value).slice(0, 11);
    let out = d;
    out = out.replace(/^(\d{3})(\d)/, "$1.$2");
    out = out.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
    out = out.replace(/(\d{3})-(\d{1,2})$/, "$1-$2");
    out = out.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, "$1.$2.$3-$4");
    return out;
  };