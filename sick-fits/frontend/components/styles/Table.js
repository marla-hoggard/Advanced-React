import styled from 'styled-components';

const Table = styled.table`
  border-spacing: 0;
  width: 100%;
  border: 1px solid ${props => props.theme.offWhite};
  td,
  th {
    border-bottom: 1px solid ${props => props.theme.offWhite};
    border-right: 1px solid ${props => props.theme.offWhite};
    padding: 5px;
    position: relative;
    font-size: 10px;
    &:last-child {
      border-right: none;
      button {
        width: 100%;
      }
    }
    button {
      cursor: pointer;
    }
    label {
      display: block;
      padding: 10px 5px;
      cursor: pointer;
      text-align: center;
    }
  }
  th {
    font-size: 12px;
    background: ${props => props.theme.red};
    color: white;
  }
  tr {
    &:hover {
      background: ${props => props.theme.offWhite};
    }
  }
`;

export default Table;
