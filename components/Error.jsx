import React from "react";
import { useRouteError } from "react-router-dom";

export default function Error() {
  const error = useRouteError();
  return <div>Something went wrong. {error.status}</div>;
}
