import { useState, useEffect } from "react";
import { differenceInYears, parse } from "date-fns";

export const useAgeCalculation = (dob: string, spouseDob: string) => {
  const [age, setAge] = useState("");
  const [spouseAge, setSpouseAge] = useState("");

  useEffect(() => {
    if (dob) {
      const birthDate = parse(dob, 'yyyy-MM-dd', new Date());
      const calculatedAge = differenceInYears(new Date(), birthDate);
      setAge(calculatedAge.toString());
    }

    if (spouseDob) {
      const spouseBirthDate = parse(spouseDob, 'yyyy-MM-dd', new Date());
      const calculatedSpouseAge = differenceInYears(new Date(), spouseBirthDate);
      setSpouseAge(calculatedSpouseAge.toString());
    }
  }, [dob, spouseDob]);

  return { age, spouseAge };
};