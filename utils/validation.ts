import {
  helpers,
  minLength as minLengthHelper,
  maxLength as maxLengthHelper,
  integer,
} from "@vuelidate/validators";
import type { ValidationError } from "@/common/types/types";
import { uniq } from "lodash";

export const required = (fieldName: string, message?: string) =>
  helpers.withMessage(
    message ?? `${fieldName} is required.`,
    (value: unknown) =>
      !(
        value === null ||
        value === undefined ||
        (typeof value === "string" && !value.length) ||
        (Array.isArray(value) && !value.length)
      )
  );

export const requiredIf = (
  fieldName: string,
  condition: () => boolean,
  message?: string
) =>
  helpers.withMessage(
    message ?? `${fieldName} is required.`,
    (value: unknown) =>
      !condition() ||
      !(
        value === null ||
        value === undefined ||
        (typeof value === "string" && !value.length)
      )
  );

export const minLength = (length: number) =>
  helpers.withMessage(`Min length is ${length}.`, minLengthHelper(length));

export const maxLength = (length: number) =>
  helpers.withMessage(`Max length is ${length}.`, maxLengthHelper(length));

export const noEmptySpacesAndLineBreaks = helpers.withMessage(
  `Empty spaces and line breaks are not allowed here`,
  helpers.regex(/^\S+$/)
);

export const mustBeInteger = helpers.withMessage("Must be integer", integer);

export const mustBeHexOrInteger = helpers.withMessage(
  "Must be HEX or integer",
  (value: string) => {
    return !isNaN(parseInt(value));
  }
);

export const moreThanNumber = (number: number) =>
  helpers.withMessage(`Must be greater than ${number}`, (value: unknown) => {
    return Number(value) > number;
  });

export const mustBeUnique = (
  fieldName: string,
  array: unknown[],
  message?: string
) =>
  helpers.withParams(
    { type: "mustBeUnique" },
    helpers.withMessage(
      message ?? `${fieldName} must be unique.`,
      (value: unknown) => !array.includes(value)
    )
  );

export const lessThen = (lessThenValueKey: string, message: string) =>
  helpers.withMessage(
    message,
    (value: number | null, form: Record<string, unknown>) => {
      const lessThenValue = form[lessThenValueKey];

      if (
        lessThenValue === null ||
        !Number.isInteger(Number(lessThenValue as number | string)) ||
        value === null ||
        !Number.isInteger(Number(value))
      ) {
        return true;
      }
      return (value as number) < (lessThenValue as number);
    }
  );

export const moreThen = (moreThenValueKey: string, message: string) =>
  helpers.withMessage(
    message,
    (value: number | null, form: Record<string, unknown>) => {
      const moreThenValue = form[moreThenValueKey];

      if (
        moreThenValue === null ||
        !Number.isInteger(Number(moreThenValue as number | string)) ||
        value === null ||
        !Number.isInteger(Number(value))
      ) {
        return true;
      }
      return (value as number) > (moreThenValue as number);
    }
  );

export const joinUniqueErrorMessages = (errors: ValidationError[] | null) => {
  if (!errors) return "";
  return uniq(errors.map((err) => err.error)).join(", ");
};
