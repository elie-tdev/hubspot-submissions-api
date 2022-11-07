import { useState, useEffect, useMemo } from "react";

interface Field {
  name: string;
  value: string;
}

interface DataType {
  fields: Array<Field>;
}

const useHubspotForm = ({
  portalId,
  formId,
}: {
  portalId: string;
  formId: string;
}) => {
  const [data, setData] = useState();
  const [form, setForm] = useState<boolean | HTMLFormElement>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const url = useMemo(
    () =>
      `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
    [portalId, formId]
  );

  const fetchData = async () => {
    setIsError(false);
    setIsLoading(true);
    try {
      const formData = new FormData(form as HTMLFormElement);
      const data: DataType = {
        fields: [],
      };
      // @ts-ignore
      for (var pair of formData.entries()) {
        if (pair[0] !== "password")
          data.fields.push({ name: pair[0].toLowerCase(), value: pair[1] });
      }
      const result = await fetch(url, {
        method: "post",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const body = await result.json();
      setData(body);
      setForm(false);
    } catch (e) {
      setIsError(true);
      setForm(false);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (form) {
      fetchData();
    }
  }, [form]);

  const handleSubmit = (e: {
    preventDefault: () => void;
    target:
      | boolean
      | HTMLFormElement
      | ((prevState: boolean | HTMLFormElement) => boolean | HTMLFormElement);
  }) => {
    e.preventDefault();
    setForm(e.target);
  };

  return { data, isLoading, isError, handleSubmit };
};

export default useHubspotForm;
