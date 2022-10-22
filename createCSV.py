""" Processing data and creating new csv files for the Sankey chart """

import pandas as pd

data = pd.read_csv('final.csv')
decade = "_10s"
start = 200
end = 300

df = data.iloc[start:end]
df = df[['Genre', 'Album Length', 'Worldwide Sales (Est.)']]

for i in range(start, end):
    album_length = float(df.loc[i]['Album Length'])
    worldwide_sales = float((df.loc[i]['Worldwide Sales (Est.)']).replace(',', ''))

    if album_length < 40:
        df.loc[i, 'Album Length'] = '<40'
    elif album_length < 60:
        df.loc[i, 'Album Length'] = '40-60'
    elif album_length < 80:
        df.loc[i, 'Album Length'] = '60-80'
    else:
        df.loc[i, 'Album Length'] = '>80'

    if worldwide_sales >= 20000000:
        df.loc[i, 'Worldwide Sales (Est.)'] = '>20'
    elif worldwide_sales >= 15000000:
        df.loc[i, 'Worldwide Sales (Est.)'] = '15-20'
    elif worldwide_sales >= 10000000:
        df.loc[i, 'Worldwide Sales (Est.)'] = '10-15'
    elif worldwide_sales >= 5000000:
        df.loc[i, 'Worldwide Sales (Est.)'] = '5-10'
    else:
        df.loc[i, 'Worldwide Sales (Est.)'] = '<5'
    
    df.loc[i, 'row'] = str(i)

df.to_csv(f'sankey_data' + decade + '.csv', index=False)

sankey_data = pd.read_csv('sankey_data' + decade + '.csv')
print(sankey_data)

df_1 = sankey_data[['Genre', 'Album Length', 'row']]
df_2 = sankey_data[['Album Length', 'Worldwide Sales (Est.)', 'row']]

df_1.rename(columns={'Genre': 'source'}, inplace=True)
df_1.rename(columns={'Album Length': 'target'}, inplace=True)
df_1['value'] = 1

df_2.rename(columns={'Album Length': 'source'}, inplace=True)
df_2.rename(columns={'Worldwide Sales (Est.)': 'target'}, inplace=True)
df_2['value'] = 1

pd.concat([df_1, df_2]).to_csv(f'sankey_chart' + decade + '.csv', index=False)

sankey = pd.read_csv('sankey_chart' + decade + '.csv')

sorted = sankey.pivot_table(columns=['source', 'target'], aggfunc={'value': 'size'}).transpose()
sorted.to_csv(f'sankey_sorted' + decade + '.csv', index=True)
