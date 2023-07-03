import { Collapse } from 'antd';

export default function AccordionContent(props) {

    const { Panel } = Collapse;

    return (
        <Collapse accordion expandIconPosition="end" className={`${props.className}`}>
            <Panel header={props.title}>
                {props.children}
            </Panel>
        </Collapse>
    )
}