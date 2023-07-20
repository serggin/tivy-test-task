import { useRouteError } from 'react-router-dom';

export function ErrorPage() {
  const error = useRouteError();
  function isError(error: any): error is { statusText: string } {
    return 'statusText' in error;
  }
  return (
    <>
      <div className="">
        <h2 className="">Sorry, an error has occurred</h2>
        {isError(error) && <p className="">{error.statusText}</p>}
      </div>
    </>
  );
}