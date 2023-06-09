import { FunctionComponent, Fragment } from 'react';
import { IconButton } from '@mui/material';
import { DeleteOutlined } from '@mui/icons-material';
import useSWR, { mutate } from 'swr';
import { useStorage } from '../react-hooks/useStorage';
import defaultCorsProxies from '../react-hooks/defaultCorsProxies.json';

const CorsProxyDelete: FunctionComponent<{ text: string }> = (props: {
  text: string;
}) => {
  const { persistLocal, fetchFileLocal } = useStorage();
  const { data: corsProxiesdata } = useSWR(
    'corsProxies',
    fetchFileLocal('corsProxies', defaultCorsProxies),
    { fallbackData: defaultCorsProxies }
  );
  const corsProxies = { ...(corsProxiesdata as object) };

  const deleteCorsProxy = () => {
    const newCorsProxies = {
      ...Object.fromEntries(
        Object.entries(corsProxies).filter(
          (corsProxy: [string, unknown]) => corsProxy[0] !== props.text
        )
      ),
    };
    mutate('corsProxies', persistLocal('corsProxies', newCorsProxies), {
      optimisticData: newCorsProxies,
      rollbackOnError: true,
    })
  };

  return (
    <Fragment>
      {Object.entries(corsProxies)
        .filter((corsProxy: [string, unknown]) => corsProxy[0] === props.text)
        .map((corsProxy: [string, unknown]) => {
          return (
            <Fragment key={`${corsProxy}`}>
              <IconButton
                aria-label={`delete cors proxy ${corsProxy}`}
                onClick={deleteCorsProxy}
              >
                <DeleteOutlined />
              </IconButton>
            </Fragment>
          );
        })}
    </Fragment>
  );
};

export default CorsProxyDelete;
