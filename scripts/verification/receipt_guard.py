"""Fail-closed live receipt validation; independent of fixture file names."""
from decimal import Decimal

def validate_live_receipts(receipts, result, requests, raw_finals, forwarded, row, bounds, reservation):
    if not receipts or forwarded <= 0 or result.get('failed') is not False:
        return False, Decimal(0)
    if result.get('receipts') != forwarded or len(receipts) != forwarded:
        return False, Decimal(0)
    live = [r for r in requests if r.get('mode') == 'live']
    if len(live) != forwarded or len(raw_finals) != forwarded:
        return False, Decimal(0)
    total = Decimal(0)
    seen = set()
    for n, receipt in enumerate(receipts):
        rid = receipt.get('id')
        if not isinstance(rid, str) or not rid or 'fixture' in rid.lower() or 'synthetic' in rid.lower() or rid in seen:
            return False, Decimal(0)
        seen.add(rid)
        req = live[n]
        if req.get('turn') != n or req.get('body', {}).get('model') != row['id']:
            return False, Decimal(0)
        raw = raw_finals[n]
        if not isinstance(raw, dict) or raw.get('status') != 200:
            return False, Decimal(0)
        import json
        terminals=[]
        try:
            for frame in raw.get('body','').split('\n\n'):
                data='\n'.join(line[5:].strip() for line in frame.splitlines() if line.startswith('data:'))
                if not data or data=='[DONE]': continue
                event=json.loads(data,parse_float=Decimal)
                if event.get('type') in ['response.completed','response.incomplete','response.failed']:terminals.append(event)
        except (ValueError,TypeError): return False, Decimal(0)
        if len(terminals)!=1 or terminals[0].get('type')!='response.completed' or terminals[0].get('response')!=receipt:
            return False, Decimal(0)
        if receipt.get('status')!='completed':return False, Decimal(0)
        usage=receipt.get('usage',{});inp=usage.get('input_tokens');out=usage.get('output_tokens')
        if type(inp) is not int or type(out) is not int or inp<0 or out<0:
            return False, Decimal(0)
        assert out<=row['maxOutputTokens'] and inp<=bounds['limits'][n]+1024+row['imageTokenReserve'],'Token bound violation'
        reasoning=usage.get('output_tokens_details',{}).get('reasoning_tokens',0)
        assert type(reasoning) is int and 0<=reasoning<=out,'Invalid reasoning usage'
        value=receipt.get('cost',{}).get('total')
        if isinstance(value,bool) or not isinstance(value,(int,float,Decimal)):return False,Decimal(0)
        cost=Decimal(str(value));assert cost.is_finite() and cost>=0,'Invalid cost'
        total+=cost
    assert total<=reservation,'Cost bound violation'
    return True,total
