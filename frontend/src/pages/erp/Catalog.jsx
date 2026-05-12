import Inventory from '../Inventory';

/** Product catalog — same data as Inventory, ERP naming. */
export default function Catalog(props) {
  return <Inventory {...props} pageTitle="Catalog" />;
}
