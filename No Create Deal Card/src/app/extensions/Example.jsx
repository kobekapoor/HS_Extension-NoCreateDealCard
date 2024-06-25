import React, { useState, useEffect } from 'react';
import {
  Button,
  Divider,
  Tile,
  Flex,
  hubspot,
  logger,
  Box,
  Link,
  Text,
  Alert,
  LoadingSpinner,
} from '@hubspot/ui-extensions';

hubspot.extend(({ runServerlessFunction }) => <SidebarLogging runServerless={runServerlessFunction} />);

const SidebarLogging = ({ runServerless }) => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [deals, setDeals] = useState(0);

  useEffect(() => {
    // Request statistics data from serverless function
    runServerless({
      name: 'myFunc',
      propertiesToSend: ['hs_object_id'],
    })
      .then((serverlessResponse) => {
        if (serverlessResponse.status == 'SUCCESS') {
          const { response } = serverlessResponse;
          setDeals(response.deals);
        } else {
          setErrorMessage(serverlessResponse.message);
        }
      })
      .catch((error) => {
        setErrorMessage(error.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [runServerless]);

  if (loading) {
    // If loading, show a spinner
    return <LoadingSpinner />;
  }
  if (errorMessage) {
    // If there's an error, show an alert
    return (
      <Alert title="Unable to get deals data" variant="error">
        {errorMessage}
      </Alert>
    );
  }
  return (
    <Flex direction="column" align="start" gap="small">
      <Flex direction="row" gap="small" justify="start">
        <Button variant="primary" size="medium">Create Deal</Button>
      </Flex>
      {deals.map((deal) => (
        <Flex direction="row">
            <Tile compact={true}>
              <Flex direction="column" gap="extra-small">
                <Link href={`https://app-eu1.hubspot.com/contacts/144935251/record/0-3/${deal.id}`}>{deal.properties.dealname}</Link>
                <Divider />
                <Text inline="true" truncate="true">Amount: {deal.properties.amount ? '$' + deal.properties.amount : '--'}</Text>
                <Text inline="true" truncate="true">Close Date: {deal.properties.closedate ? new Date(deal.properties.closedate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '--'}</Text>
                <Text inline="true" truncate="true">Stage: {deal.properties.dealstage ? deal.properties.dealstage : '--'}</Text>
              </Flex>
            </Tile>
        </Flex>
      ))}
    </Flex>
  );
};