import { useEffect, useState } from "react";
import useFetch from "./useFetch";
import { toDataURL } from "qrcode";
import keccak256 from "keccak256";
import Web3 from "web3";

const Verify = ( { accounts }) => {
  const URL = 'https://try.readme.io/https://testnets-api.opensea.io/api/v1/asset/0x4D2669542f0e6041C83c83cbEDa8df6262977Ec1/3/?account_address=0xaB50035F25F96dd3DEf1A7a9cC4E1C81AD6a7651';
  const [image, setImage] = useState('');
  const [ticketNum, setTicketNum] = useState(0);
  const [userOwnsTickets, setOwnsTicket] = useState(false);
  const { data: nftData, isPending, error }  = useFetch(URL);
  // to generate qrcode
  const [nftUrl, setNftUrl] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [hideNft, setHide] = useState(false);

  useEffect(() => {
    if (nftData !== null) {
      // console.log(nftData);
      const ownerships = nftData.top_ownerships;
      for (const ownership of ownerships) {
        if (accounts[0] === ownership.owner.address) {
          setOwnsTicket(true);
          setTicketNum(ownership.quantity);
          setImage(nftData.image_original_url);
        }
      }
    }
    console.log(userOwnsTickets);
  }, [accounts,nftUrl, nftData, userOwnsTickets]);
  
  // QRCode generater
  // option to fill in
  let opts = {
    errorCorrectionLevel: 'H',
    type: 'image/jpeg',
    quality: 0.1,
    margin: 4,
    color: {
      dark:"#000000",
      light:"#FFFFFF"
    }
  }

  const buf2hex = (buffer) => { // buffer is an ArrayBuffer
    return ["0x", ...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('');
  }
  
  // generate QRCode
  const handleQRCode = () => {

    const addedMessage = "token3_audience_tickets";
    const addedAddress = accounts[0];
    const encodePackedMessage = Web3.utils.encodePacked( addedMessage, addedAddress);
    //   {value: addedMessage, type: 'string'}, 
    //   {value: addedAddress, type: 'string'}
    // );
    const hashedMessage = buf2hex(keccak256(encodePackedMessage));
    
    toDataURL(hashedMessage, opts, (err, url) => {
      if (err) throw err;
      setImgUrl(url);
      setHide(true);
    })
  } 

  return (
    <div>
      <div className="nft-data">
        { !isPending && userOwnsTickets && !hideNft &&
          <div className="nft-box">
            <button onClick={() => handleQRCode()}><img src={image} alt="nft-img" className="nft-img"/></button>
            <div className="nft-num">You have { ticketNum } tickets</div>
          </div>
        }
        { hideNft && <img src={imgUrl} alt="qrcode" className="qrcode"/> }
        { isPending && <div className="pending">Loading ...</div> }
        { !isPending && !userOwnsTickets && <div className="no-ticket"> You don't own any ticket yet! </div>}
      </div>
    </div>
  );
}
 
export default Verify;