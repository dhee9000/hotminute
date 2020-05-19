import React from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';


// GQL QUERIES (THESE SHOULD GO IN A SEPARATE FILE)
const EXCHANGE_RATES = gql`
  {
    rates(currency: "USD") {
      currency
      rate
    }
  }
`;

const ADD_EX_RATE = gql`
    {
        addRate(currencyName: "PITHANI", rateUSD: 1000)
    }
`

// CLASS COMPONENT
class ExchangeRates extends React.Component {
    render() {
        const { loading, error, data } = useQuery(EXCHANGE_RATES);
        const [addRate] = useMutation(ADD_EX_RATE);

        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error :(</p>;

        return data.rates.map(({ currency, rate }) => (
            <div key={currency}>
                <p>
                    {currency}: {rate}
                </p>
                <div onPress={() => addRate()} />
            </div>
        ));
    }
}

// FUNCTIONAL COMPONENT
function ExchangeRates() {
    const { loading, error, data } = useQuery(EXCHANGE_RATES);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error :(</p>;

    return data.rates.map(({ currency, rate }) => (
        <div key={currency}>
            <p>
                {currency}: {rate}
            </p>
        </div>
    ));
}
