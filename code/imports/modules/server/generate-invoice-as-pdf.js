import ReactDOMServer from 'react-dom/server';
import pdf from 'html-pdf';
import fs from 'fs';
import StaticInvoice from '../../ui/components/StaticInvoice/StaticInvoice';
import Invoices from '../../api/Invoices/Invoices';
import Recipients from '../../api/Recipients/Recipients';

let action;

const getBase64String = (path) => {
  try {
    const file = fs.readFileSync(path);
    return new Buffer(file).toString('base64');
  } catch (exception) {
    action.reject(exception);
  }
};

const generatePDF = (html, fileName, format) => {
  try {
    pdf.create(html, {
      format: 'letter',
      border: { top: '0.4in', right: '0.6in', bottom: '0.6in', left: '0.6in' },
    }).toFile(`./tmp/${fileName}`, (error, response) => {
      if (error) action.reject(error);
      if (response) {
        action.resolve(getBase64String(response.filename));
        fs.unlink(response.filename);
      }
    });
  } catch (exception) {
    action.reject(exception);
  }
};

const getInvoiceAsHTML = ({ invoice, recipient }) => {
  try {
    return ReactDOMServer.renderToStaticMarkup(
      StaticInvoice({ loading: false, invoice, recipient }),
    );
  } catch (exception) {
    action.reject(exception);
  }
};

const getInvoiceData = (invoiceId) => {
  try {
    const invoice = Invoices.findOne(invoiceId);
    const recipient = Recipients.findOne(invoice.recipientId);
    return { invoice, recipient };
  } catch (exception) {
    action.reject(exception);
  }
};

const handler = ({ invoiceId }, promise) => {
  action = promise;
  const invoiceData = getInvoiceData(invoiceId);
  const html = getInvoiceAsHTML(invoiceData);
  const fileName = `beagle_bone_invoice_${invoiceId}.pdf`;
  if (html && fileName) generatePDF(html, fileName);
};

export default options =>
  new Promise((resolve, reject) =>
    handler(options, { resolve, reject }));
